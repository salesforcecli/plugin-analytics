/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, Ux } from '@salesforce/sf-plugins-core';
import { Connection, Messages, SfError } from '@salesforce/core';
import { type AnyJson } from '@salesforce/ts-types';
import DatasetSvc, { DatasetType } from '../dataset/dataset.js';
import { connectRequest } from '../request.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'query');

export const LIMIT_FLAG = Flags.integer({
  summary: messages.getMessage('limitDescription'),
  description: messages.getMessage('limitLongDescription'),
  min: 0,
});

export const RESULT_FORMAT_FLAG = Flags.string({
  char: 'r',
  summary: messages.getMessage('resultformatDescription'),
  description: messages.getMessage('resultformatLongDescription'),
  options: ['human', 'csv', 'json'] as const,
  default: 'human',
});

export const DRYRUN_FLAG = Flags.boolean({
  hidden: true,
  description: "Show the resulting query that would be executed, but don't run it",
  default: false,
});

export type QueryLanguage = 'Saql' | 'Sql';
export type QueryRequest = {
  query: string;
  queryLanguage?: QueryLanguage;
  timezone?: string;
  // the backend also supports a 'metadata' array but we're not using that
};

type ExtraProps = Record<string, unknown>;

export type QueryResults = ExtraProps & {
  metadata: SaqlMetadata[] | SqlMetadata[] | SqlLiveMetadata;
  records: Row[];
};

export type QueryResponse =
  // external connector (live dataset) queries just return the metadata+records at the root object
  | QueryResults
  // but saql/sql queries return this structure
  | (ExtraProps & {
      query: string;
      responseId: string;
      responseTime: number;
      action: string;
      results: QueryResults;
    });

export type SaqlMetadata = ExtraProps & {
  lineage: SaqlLineageNode;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  queryLanguage?: 'SAQL' | string;
};

export type SaqlLineageNode = SaqlGroupNode | SaqlForeachNode | SaqlUnionNode;

export type SaqlGroup = ExtraProps & {
  id: string;
  datePart?: string;
};

export type SaqlGroupNode = ExtraProps & {
  type: 'group';
  groups: SaqlGroup[];
};

export type SaqlInput = ExtraProps & {
  id: string;
  function?: string;
};

/* Projected field types are only defined at the root level. */
type SaqlField = ExtraProps & {
  id: string;
  type?:
    | 'string'
    | 'numeric'
    | 'boolean'
    | 'date'
    | 'dateonly'
    | 'datetime'
    // "unknown" types can be produced in the case that an error occurs while determining lineage within the query engine.
    | 'unknown';
};

type SaqlProjection = ExtraProps & {
  field: SaqlField;
  inputs?: SaqlInput[];
};

export type SaqlForeachNode = ExtraProps & {
  type: 'foreach';
  projections: SaqlProjection[];
  input?: SaqlLineageNode;
};

export type SaqlUnionNode = ExtraProps & {
  type: 'union';
  inputs: Array<SaqlForeachNode | SaqlUnionNode>;
};

export type SqlMetadata = ExtraProps & {
  columns: Array<ExtraProps & { columnLabel: string; columnType: string }>;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  queryLanguage?: 'SQL' | string;
};

export type SqlLiveMetadata = ExtraProps & {
  columns: Array<ExtraProps & { label: string; type: string }>;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  queryLanguage?: 'SQL' | string;
};

type SingleValue = number | string | boolean | null;

export type Row = { [key: string]: SingleValue | SingleValue[] };

/** A query request to an external data connector (e.g. Live Dataset). */
export type ExternalQueryRequest = {
  query: string;
  connectorIdOrApiName: string;
};

export default class QuerySvc {
  private readonly queryUrl: string;

  public constructor(private readonly connection: Connection) {
    this.queryUrl = `${this.connection.baseUrl()}/wave/query`;
  }

  public async execute(query: QueryRequest): Promise<QueryResponse> {
    const response = await connectRequest(this.connection, {
      method: 'POST',
      url: this.queryUrl,
      body: JSON.stringify(query),
    });
    if (response) {
      return response as QueryResponse;
    } else {
      throw new SfError('Empty http response');
    }
  }

  /** Make a query against an external data connector (i.e. Live Dataset). */
  public async executeExternal(query: ExternalQueryRequest): Promise<QueryResponse> {
    const response = await connectRequest(this.connection, {
      method: 'POST',
      url: `${this.connection.baseUrl()}/wave/dataConnectors/${encodeURIComponent(query.connectorIdOrApiName)}/query`,
      body: JSON.stringify({ query: query.query }),
    });
    if (response) {
      return response as QueryResponse;
    } else {
      throw new SfError('Empty http response');
    }
  }

  /** Convert any datanames names in the SAQL query to the dataset id/currentVersionId format, using
   * a {@link DatasetSvc} to fetch the datasets.
   */
  public async mapDatasetNames(query: string): Promise<string> {
    const dsSvc = new DatasetSvc(this.connection);
    return mapDatasetNames(query, async (name) => {
      let dataset: DatasetType;
      try {
        dataset = await dsSvc.fetch(name);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new SfError(`Unable to fetch dataset ${name}: ${msg}`);
      }
      if (!dataset.currentVersionId) {
        throw new SfError(`Dataset ${name} (${dataset.id}) does not have a current version id`);
      }

      return `${dataset.id}/${dataset.currentVersionId}`;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public computeColumnNames(response: QueryResponse): string[] {
    return computeColumnNames(response);
  }

  /** Run a query-ish sfdx command and possibly do some output
   *
   * @param query the query request
   * @param ux the command Ux, or undefined to do no output
   * @param limit the max number of rows to output and return (undefined for all)
   * @param resultforamt 'json', 'csv', or anything else for an sfdx table
   * @return the query response
   */
  public async runQueryCommand(
    query: QueryRequest,
    params: { ux?: Ux; limit?: number; resultformat?: string; dryrun?: false }
  ): Promise<QueryResponse>;
  public async runQueryCommand(
    query: QueryRequest,
    params: { ux?: Ux; limit?: number; resultformat?: string; dryrun: true }
  ): Promise<undefined>;
  public async runQueryCommand(
    query: QueryRequest,
    { ux, limit, resultformat, dryrun }: { ux?: Ux; limit?: number; resultformat?: string; dryrun: boolean }
  ): Promise<QueryResponse | undefined>;
  public async runQueryCommand(
    query: QueryRequest,
    { ux, limit, resultformat, dryrun = false }: { ux?: Ux; limit?: number; resultformat?: string; dryrun?: boolean }
  ): Promise<QueryResponse | undefined> {
    if (dryrun) {
      ux?.log(messages.getMessage('dryrunHeader'));
      ux?.styledJSON(query);
      return undefined;
    }
    return this.processQueryCommandResponse(await this.execute(query), { ux, limit, resultformat });
  }

  /** Run an external query-ish sfdx command and possibly do some output
   *
   * @param query the query request
   * @param ux the command Ux, or undefined to do no output
   * @param limit the max number of rows to output and return (undefined for all)
   * @param resultforamt 'json', 'csv', or anything else for an sfdx table
   * @return the query response
   */
  public async runExternalQueryCommand(
    query: ExternalQueryRequest,
    params: { ux?: Ux; limit?: number; resultformat?: string; dryrun?: false }
  ): Promise<QueryResponse>;
  public async runExternalQueryCommand(
    query: ExternalQueryRequest,
    params: { ux?: Ux; limit?: number; resultformat?: string; dryrun: true }
  ): Promise<undefined>;
  public async runExternalQueryCommand(
    query: ExternalQueryRequest,
    { ux, limit, resultformat, dryrun }: { ux?: Ux; limit?: number; resultformat?: string; dryrun: boolean }
  ): Promise<QueryResponse | undefined>;
  public async runExternalQueryCommand(
    query: ExternalQueryRequest,
    { ux, limit, resultformat, dryrun = false }: { ux?: Ux; limit?: number; resultformat?: string; dryrun?: boolean }
  ): Promise<QueryResponse | undefined> {
    if (dryrun) {
      ux?.log(messages.getMessage('dryrunHeader'));
      ux?.log(query.query);
      return undefined;
    }
    return this.processQueryCommandResponse(await this.executeExternal(query), { ux, limit, resultformat });
  }

  /** Process a query response, possibly doing some output.
   *
   * @param query the query request
   * @param ux the command Ux, or undefined to do no output
   * @param limit the max number of rows to output and return (undefined for all)
   * @param resultforamt 'json', 'csv', or anything else for an sfdx table
   * @return the query response
   */
  private processQueryCommandResponse(
    response: QueryResponse,
    { ux, limit, resultformat }: { ux?: Ux; limit?: number; resultformat?: string }
  ): QueryResponse {
    const results = getQueryResults(response);
    const records = results && Array.isArray(results?.records) ? results.records : [];
    if (typeof limit === 'number' && limit >= 0 && records.length > limit) {
      records.length = limit;
    }

    if (ux) {
      if (resultformat === 'json') {
        ux.styledJSON(response as AnyJson);
      } else {
        const columnNames = this.computeColumnNames(response);
        if (resultformat === 'csv') {
          writeCsvLine(ux, columnNames);
          records.forEach((record) => {
            const values = columnNames.map((columnName) => record[columnName]);
            writeCsvLine(ux, values);
          });
        } else if (columnNames.length <= 0) {
          // resultformat === 'human', do a table
          ux.log(messages.getMessage('noResultsMesg'));
        } else {
          ux.table(
            records,
            columnNames.reduce<Ux.Table.Columns<Row>>((all, name) => {
              all[name] = { header: name, get: () => convertRowValue(name) };
              return all;
            }, {})
          );
          ux.styledHeader(messages.getMessage('rowsFound', [records.length]));
        }
      }
    }
    return response;
  }
}

export function convertRowValue(value: unknown): string {
  return Array.isArray(value) ? '[' + value.join(',') + ']' : typeof value === 'string' ? value : String(value);
}

function writeCsvLine(ux: Ux, values: unknown[], delim = ','): void {
  let line = '';
  for (let i = 0; i < values.length; i++) {
    if (i !== 0) {
      line += delim;
    }
    if (values[i]) {
      const value = convertRowValue(values[i]).replace(/"/g, '""');
      if (value.includes(delim) || value.includes('\n')) {
        line += `"${value}"`;
      } else {
        line += value;
      }
    }
  }
  ux.log(line);
}

const LOAD_RE = /load(\s+)"([^"]+)"/;
/** Convert any datanames names in the SAQL query to the dataset id/currentVersionId format.
 *
 * @param query the saql text.
 * @param nameToRef function to map dataset name to "id/versionId" ref format, should throw an error if
 *                  the dataset is unavailable.
 */
export async function mapDatasetNames(query: string, nameToRef: (name: string) => Promise<string>): Promise<string> {
  // go through each expression in the saql
  const lines = query.split(';');
  for (let i = 0, len = lines.length; i < len; i++) {
    // see if it's a '... load "DatasetName"'
    const matches = LOAD_RE.exec(lines[i]);
    if (!matches?.[2]) {
      continue;
    }
    // pull the dataset name from that
    const name = matches[2];
    // if it's not already of the "id/versionid" form, fetch the dataset and string sub
    if (!name.includes('/')) {
      // eslint-disable-next-line no-await-in-loop
      const ref = await nameToRef(name);
      lines[i] = lines[i].replace(matches[0], `load${matches[1]}"${ref}"`);
    }
  }

  return lines.join(';');
}

function getQueryResults(response: QueryResponse): QueryResults | undefined {
  return typeof response.metadata === 'object' || typeof response.records === 'object'
    ? (response as QueryResults)
    : (response.results as QueryResults);
}
/** Compute the set of columns names from the query response metadata. */
export function computeColumnNames(response: QueryResponse): string[] {
  const names = new Set<string>();

  const results = getQueryResults(response);
  if (results && Array.isArray(results?.metadata)) {
    results.metadata.forEach((md: ExtraProps) => {
      // SqlMetadata
      if (Array.isArray(md?.columns)) {
        md.columns.forEach((c: ExtraProps) => {
          if (c.columnLabel) {
            names.add(c.columnLabel as string);
          }
        });
      } else if (Array.isArray((md?.lineage as ExtraProps)?.projections)) {
        // SaqlMetadata
        ((md.lineage as ExtraProps).projections as SaqlProjection[]).forEach((p: SaqlProjection) => {
          if (p.field?.id) {
            let name = p.field.id;
            const index = name.indexOf('.');
            if (index >= 0) {
              name = name.substring(index + 1);
            }
            names.add(name);
          }
        });
      }
    });
  } else if (typeof results?.metadata === 'object' && Array.isArray((results.metadata as ExtraProps).columns)) {
    // SqlLiveMetadata
    ((results.metadata as ExtraProps).columns as SqlLiveMetadata[]).forEach((col: SqlLiveMetadata) => {
      if (col.label) {
        names.add(col.label as string);
      }
    });
  }

  // if the metadata didn't match anything, just use the keys in the first result record
  if (names.size <= 0 && results && Array.isArray(results.records) && results.records[0]) {
    return Object.keys(results.records[0]);
  }

  return Array.from(names);
}
