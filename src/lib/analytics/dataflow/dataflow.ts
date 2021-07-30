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
export default class Dataflow {
  private readonly connection: Connection;
  private readonly dataflowsUrl: string;

  public constructor(organization: Org) {
    this.connection = organization.getConnection();
    this.dataflowsUrl = `${this.connection.baseUrl()}/wave/dataflows/`;
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
}
