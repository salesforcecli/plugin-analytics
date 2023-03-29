/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Connection, Org } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request';
import { throwError } from '../utils';

export type DataflowHistoryType = {
  id?: string;
  name?: string;
  label?: string;
};

export type DataflowType = Record<string, unknown> & {
  id?: string;
  namespace?: string;
  name?: string;
  label?: string;
  type?: string;
  createdBy?: Record<string, unknown> & {
    id?: string;
    name?: string;
    profilePhotoUrl?: string;
  };
  createdDate?: string;
  definition?: unknown;
  emailNotificationLevel?: string;
  historiesUrl?: string;
  lastModifiedBy?: Record<string, unknown> & {
    id?: string;
    name?: string;
    profilePhotoUrl?: string;
  };
  lastModifiedDate?: string;
  url?: string;
};

export type DataflowJobType = Record<string, unknown> & {
  duration?: number;
  id?: string;
  jobType?: string;
  label?: string;
  nodesUrl?: string;
  progress?: number;
  retryCount?: number;
  createdDate?: string;
  executedDate?: string;
  startDate?: string;
  status?: 'Failure' | 'Queued' | 'Live' | 'Running' | 'Success' | 'Warning' | string;
  syncDataflows?: [];
  type?: string;
  url?: string;
  waitTime?: number;
};

export default class Dataflow {
  private readonly connection: Connection;
  private readonly dataflowsUrl: string;
  private readonly dataflowsJobsUrl: string;

  public constructor(organization: Org) {
    this.connection = organization.getConnection();
    this.dataflowsUrl = `${this.connection.baseUrl()}/wave/dataflows/`;
    this.dataflowsJobsUrl = `${this.connection.baseUrl()}/wave/dataflowjobs/`;
  }

  public list(): Promise<DataflowType[]> {
    return fetchAllPages<DataflowType>(this.connection, this.dataflowsUrl, 'dataflows');
  }

  public getHistories(dataflowId: string): Promise<DataflowHistoryType[]> {
    const historyUrl = this.dataflowsUrl + encodeURIComponent(dataflowId) + '/histories';
    // dataflow histories don't (yet) support pagination -- they always return all saved histories, but there's a
    // story to do it, and this works for both single page and multi-page (if it's later implemented in the server)
    return fetchAllPages<DataflowHistoryType>(this.connection, historyUrl, 'histories');
  }

  public async revertToHistory(
    dataflowId: string,
    historyId: string,
    historyLabel?: string
  ): Promise<string | undefined> {
    const revertUrl = this.dataflowsUrl + dataflowId;
    const response = await connectRequest<DataflowType>(this.connection, {
      method: 'PUT',
      url: revertUrl,
      body: JSON.stringify({
        historyId,
        historyLabel
      })
    });

    if (response) {
      return response.id;
    } else {
      throwError(response);
    }
  }

  public async startDataflow(dataflowId: string): Promise<DataflowJobType> {
    const command = 'start';
    const response = await connectRequest<DataflowJobType>(this.connection, {
      method: 'POST',
      url: this.dataflowsJobsUrl,
      body: JSON.stringify({
        dataflowId,
        command
      })
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }

  public async stopDataflowJob(dataflowJobId: string): Promise<DataflowJobType> {
    const command = 'stop';
    const response = await connectRequest<DataflowJobType>(this.connection, {
      method: 'PATCH',
      url: this.dataflowsJobsUrl + encodeURIComponent(dataflowJobId),
      body: JSON.stringify({
        command
      })
    });

    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }

  public async updateDataflow(dataflowId: string, definition: unknown): Promise<DataflowType> {
    const response = await connectRequest<DataflowType>(this.connection, {
      method: 'PATCH',
      url: this.dataflowsUrl + encodeURIComponent(dataflowId),
      body: JSON.stringify({ definition })
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }

  public async getDataflowJob(dataflowJobId: string): Promise<DataflowJobType> {
    const response = await connectRequest<DataflowJobType>(this.connection, {
      method: 'GET',
      url: this.dataflowsJobsUrl + encodeURIComponent(dataflowJobId)
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }

  public async getDataflowJobs(dataflowId: string): Promise<DataflowJobType[]> {
    const wtUrl = this.dataflowsJobsUrl + '?dataflowId=' + dataflowId;
    return fetchAllPages<DataflowJobType>(this.connection, wtUrl, 'dataflowJobs');
  }
}
