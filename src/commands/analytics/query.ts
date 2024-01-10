/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { Flags, SfCommand, Ux, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import QuerySvc, {
  DRYRUN_FLAG,
  LIMIT_FLAG,
  QueryLanguage,
  QueryRequest,
  QueryResponse,
  RESULT_FORMAT_FLAG,
} from '../../lib/analytics/query/query.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'query');

export default class Query extends SfCommand<QueryResponse | undefined> {
  public static readonly summary = messages.getMessage('queryCommandDescription');
  public static readonly description = messages.getMessage('queryCommandLongDescription');

  public static readonly examples = [
    'sfdx analytics:query -f query.saql',
    'sfdx analytics:query -f query.sql -t America/Denver',
    'sfdx analytics:query -q "..." --sql --limit 10 -r csv',
  ];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    queryfile: Flags.file({
      char: 'f',
      summary: messages.getMessage('queryfileDescription'),
      description: messages.getMessage('queryfileLongDescription'),
      exclusive: ['query'],
    }),
    query: Flags.string({
      char: 'q',
      summary: messages.getMessage('queryDescription'),
      description: messages.getMessage('queryLongDescription'),
      exclusive: ['queryfile'],
    }),
    nomapnames: Flags.boolean({
      summary: messages.getMessage('nomapnamesDescription'),
      description: messages.getMessage('nomapnamesLongDescription'),
      default: false,
    }),
    sql: Flags.boolean({
      summary: messages.getMessage('sqlDescription'),
      description: messages.getMessage('sqlLongDescription'),
      default: false,
    }),
    timezone: Flags.string({
      char: 't',
      summary: messages.getMessage('timezoneDescription'),
      description: messages.getMessage('timezoneLongDescription'),
    }),
    connector: Flags.string({
      summary: messages.getMessage('connectorDescription'),
      description: messages.getMessage('connectorLongDescription'),
    }),
    dryrun: DRYRUN_FLAG,
    limit: LIMIT_FLAG,
    resultformat: RESULT_FORMAT_FLAG,
  };

  public async run() {
    const { flags } = await this.parse(Query);
    if (!flags.queryfile && !flags.query) {
      throw new SfError(messages.getMessage('missingRequiredField'));
    }
    let queryStr = flags.queryfile ? await fs.readFile(flags.queryfile, 'utf8') : (flags.query as string);

    const querySvc = new QuerySvc(flags.targetOrg.getConnection());
    const options = {
      ux: new Ux({ jsonEnabled: this.jsonEnabled() }),
      limit: flags.limit,
      resultformat: flags.resultformat as string | undefined,
      dryrun: !!flags.dryrun,
    };

    if (flags.connector) {
      // Live Dataset query
      this.debug(`POSTING query to connector ${flags.connector}: ${queryStr}`);
      return querySvc.runExternalQueryCommand({ query: queryStr, connectorIdOrApiName: flags.connector }, options);
    } else {
      // guess queryLanguage from file extension (assume saql) if --sql not specified
      let queryLanguage: QueryLanguage = 'Saql';
      if (flags.sql) {
        queryLanguage = 'Sql';
      } else if (flags.queryfile) {
        const ext = path.extname(flags.queryfile);
        if (ext.toLocaleLowerCase() === '.sql') {
          queryLanguage = 'Sql';
        }
      }

      if (queryLanguage === 'Saql' && !flags.nomapnames) {
        queryStr = await querySvc.mapDatasetNames(queryStr);
      }

      const query: QueryRequest = {
        query: queryStr,
        queryLanguage,
        timezone: flags.timezone as string,
      };

      this.debug('POSTing query: ' + JSON.stringify(query, undefined, 2));
      return querySvc.runQueryCommand(query, options);
    }
  }
}
