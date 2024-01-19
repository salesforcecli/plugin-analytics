/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request.js';
import { throwError } from '../utils.js';

export type DashboardHistoryType = {
  id?: string;
  name?: string;
  label?: string;
  isCurrent?: boolean;
};
export type DashboardType = {
  id?: string;
  name?: string;
  namespace?: string;
  label?: string;
  folder?: { id?: string; name?: string };
  currentHistoryId: string;
};

type DashboardBundleType = Record<string, unknown> & {
  id?: string;
  asset?: Record<string, unknown> & {
    id?: string;
    label?: string;
  };
};

export default class Dashboard {
  private readonly dashboardsUrl: string;

  public constructor(private readonly connection: Connection) {
    this.dashboardsUrl = `${this.connection.baseUrl()}/wave/dashboards/`;
  }

  public list(): Promise<DashboardType[]> {
    return fetchAllPages<DashboardType>(this.connection, this.dashboardsUrl, 'dashboards');
  }

  public async updateCurrentHistoryId(dashboardId: string, currentHistoryId: string): Promise<string | undefined> {
    const response = await connectRequest<DashboardType>(this.connection, {
      method: 'PATCH',
      url: this.dashboardsUrl + encodeURIComponent(dashboardId),
      body: JSON.stringify({ currentHistoryId }),
    });

    if (response) {
      return response.id;
    } else {
      throwError(response);
    }
  }

  public getHistories(dashboardId: string): Promise<DashboardHistoryType[]> {
    const historyUrl = this.dashboardsUrl + encodeURIComponent(dashboardId) + '/histories';
    // dashboard histories don't (yet) support pagination -- they always return all saved histories, but there's a
    // story to do it, and this works for both single page and multi-page (if it's later implemented in the server)
    return fetchAllPages<DashboardHistoryType>(this.connection, historyUrl, 'histories');
  }

  public async revertToHistory(
    dashboardId: string,
    historyId: string,
    historyLabel?: string
  ): Promise<string | undefined> {
    const revertUrl = this.dashboardsUrl + encodeURIComponent(dashboardId) + '/bundle';
    const response = await connectRequest<DashboardBundleType>(this.connection, {
      method: 'PUT',
      url: revertUrl,
      body: JSON.stringify({
        historyId,
        historyLabel,
      }),
    });

    if (response) {
      return response.asset?.id;
    } else {
      throwError(response);
    }
  }
}
