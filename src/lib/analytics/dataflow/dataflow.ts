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

export type DataflowType = {
  id?: string;
  namespace?: string;
  name?: string;
  label?: string;
  type?: string;
};

export type DataflowJob = {
  dataflow?: DataflowType;
  date?: string;
  message?: string;
  status?: string;
  jobType?: string;
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

  public async startDataflow(dataflowId: string): Promise<DataflowJob | undefined> {
    const startDataflowUrl = this.dataflowsJobsUrl;
    const command = 'start';
    const response = await connectRequest<DataflowJob>(this.connection, {
      method: 'POST',
      url: startDataflowUrl,
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

  public async stopDataflow(dataflowId: string): Promise<DataflowJob | undefined> {
    const stopDataflowUrl = this.dataflowsJobsUrl + encodeURIComponent(dataflowId);
    const command = 'stop';
    const response = await connectRequest<DataflowJob>(this.connection, {
      method: 'PATCH',
      url: stopDataflowUrl,
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
}
