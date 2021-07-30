/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, SfdxError } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request';

export type DatasetType = Record<string, unknown> & {
  id?: string;
  name?: string;
  namespace?: string;
  label?: string;
  createdBy?: { id?: string; name?: string; profilePhotoUrl?: string };
  createdDate?: string;
  currentVersionId?: string;
  dataRefreshDate?: string;
  datasetType?: 'Default' | 'default' | 'Live' | 'live' | 'Trended' | 'trended' | string;
  folder?: { id?: string; label?: string };
  lastAccessedDate?: string;
  lastModifiedBy?: { id?: string; name?: string; profilePhotoUrl?: string };
  lastModifiedDate?: string;
  lastQueriedDate?: string;
  liveConnection?: {
    connectionName?: string;
    sourceObjectName?: string;
    connectionType?: string;
    connectionLabel?: string;
  };
};

type ExtraProps = Record<string, unknown>;

// Note: there are other properties in xmds, this is just enough of a type for pulling out the dataset field names
export type XmdType = ExtraProps & {
  dates?: Array<
    ExtraProps & {
      alias?: string;
      fields?: ExtraProps & {
        fullField?: string;
      };
    }
  >;
  dimensions?: Array<ExtraProps & { field?: string }>;
  measures?: Array<
    ExtraProps & {
      field?: string;
    }
  >;
  type?: string;
};

export type SourceObjectFieldsType = ExtraProps & {
  fields: Array<ExtraProps & { name: string; fieldType: string }>;
};

export default class DatasetSvc {
  private readonly datasetsUrl: string;

  public constructor(private readonly connection: Connection) {
    this.datasetsUrl = `${this.connection.baseUrl()}/wave/datasets`;
  }

  public list(): Promise<DatasetType[]> {
    return fetchAllPages<DatasetType>(this.connection, this.datasetsUrl, 'datasets');
  }

  public async fetch(idOrApiName: string): Promise<DatasetType> {
    const response = await connectRequest(this.connection, this.datasetsUrl + '/' + encodeURIComponent(idOrApiName));
    if (response) {
      return response as DatasetType;
    } else {
      throw new SfdxError('Missing response');
    }
  }

  public async fetchXmd(
    idOrApiName: string,
    versionId: string,
    xmdType: 'main' | 'user' | 'system' | 'asset' = 'main'
  ): Promise<XmdType> {
    const xmd = await connectRequest<XmdType>(
      this.connection,
      this.datasetsUrl +
        '/' +
        encodeURIComponent(idOrApiName) +
        '/versions/' +
        encodeURIComponent(versionId) +
        `/xmds/${xmdType}`
    );
    if (xmd) {
      return xmd;
    } else {
      throw new SfdxError('Missing response');
    }
  }

  /** Fetch the queryable field names from the specified dataset version */
  public async fetchFieldNames(idOrApiName: string, versionId: string): Promise<string[]> {
    const xmd = await this.fetchXmd(idOrApiName, versionId, 'main');
    return fetchFieldNames(xmd);
  }

  /** Fetch the field names for the specified external connector dataset. */
  public async fetchLiveDatasetFieldNames(connectorIdOrApiName: string, sourceObjectName: string): Promise<string[]> {
    const { fields } = await connectRequest<SourceObjectFieldsType>(
      this.connection,
      `${this.connection.baseUrl()}/wave/dataConnectors/${encodeURIComponent(
        connectorIdOrApiName
      )}/sourceObjects/${encodeURIComponent(sourceObjectName)}/fields`
    );
    if (Array.isArray(fields)) {
      return fields.map(f => f.name).filter(n => !!n);
    } else {
      throw new SfdxError(`Missing fields for ${connectorIdOrApiName}/${sourceObjectName}`);
    }
  }
}

/** Fetch the queryable field names from the specified xmd. */
export function fetchFieldNames(xmd: XmdType): string[] {
  const fieldsFromDates = xmd.dates?.map(d => d.fields);

  const fieldNames: string[] = [];
  [...(xmd.dimensions?.map(dim => dim.field) || []), ...(xmd.measures?.map(measure => measure.field) || [])].forEach(
    fieldName => {
      if (!fieldName) {
        return;
      }
      // it's the original field
      if (fieldsFromDates?.map(d => d?.fullField).includes(fieldName)) {
        fieldNames.push(fieldName);
        return;
      }
      const isDerived = fieldsFromDates?.some(d => d && Object.values(d).includes(fieldName));
      if (!isDerived) {
        fieldNames.push(fieldName);
      }
    }
  );
  return fieldNames;
}
