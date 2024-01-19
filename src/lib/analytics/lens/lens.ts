/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request.js';
import { throwError } from '../utils.js';

export type LensHistoryType = {
  id?: string;
  name?: string;
  label?: string;
};

export type LensType = {
  id?: string;
  name?: string;
  namespace?: string;
  label?: string;
};

type LensBundleType = Record<string, unknown> & {
  id?: string;
  asset?: Record<string, unknown> & {
    id?: string;
    label?: string;
  };
};

export default class Lens {
  private readonly lensesUrl: string;

  public constructor(private readonly connection: Connection) {
    this.lensesUrl = `${this.connection.baseUrl()}/wave/lenses/`;
  }

  public list(): Promise<LensType[]> {
    return fetchAllPages<LensType>(this.connection, this.lensesUrl, 'lenses');
  }

  public getHistories(lensId: string): Promise<LensHistoryType[]> {
    const historyUrl = this.lensesUrl + encodeURIComponent(lensId) + '/histories';
    // lens histories don't (yet) support pagination -- they always return all saved histories, but there's a
    // story to do it, and this works for both single page and multi-page (if it's later implemented in the server)
    return fetchAllPages<LensHistoryType>(this.connection, historyUrl, 'histories');
  }

  public async revertToHistory(lensId: string, historyId: string, historyLabel?: string): Promise<string | undefined> {
    const revertUrl = this.lensesUrl + encodeURIComponent(lensId) + '/bundle';
    const response = await connectRequest<LensBundleType>(this.connection, {
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
