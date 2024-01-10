/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Connection, Org } from '@salesforce/core';
import { connectRequest } from '../request.js';
import { throwError } from '../utils.js';

export type PublisherType = {
  id?: string;
  assetId?: string;
  publisherUser?: { id?: string; name?: string };
};

export default class Publisher {
  private readonly connection: Connection;
  private readonly publishersUrl: string;
  private readonly endpointName: string;

  public constructor(organization: Org) {
    this.connection = organization.getConnection();
    this.publishersUrl = `${this.connection.baseUrl()}/wave/dashboards/`;
    this.endpointName = 'publishers';
  }

  public async create(dashboardId: string): Promise<string | undefined> {
    const response = await connectRequest<PublisherType>(this.connection, {
      method: 'POST',
      url: this.publishersUrl + encodeURIComponent(dashboardId) + '/' + this.endpointName,
      body: '{}',
    });
    if (response) {
      return response.id;
    } else {
      throwError(response);
    }
  }

  public async list(assetId: string): Promise<PublisherType[] | undefined> {
    const response = await connectRequest<{ publishers?: PublisherType[] }>(this.connection, {
      method: 'GET',
      url: this.publishersUrl + encodeURIComponent(assetId) + '/' + this.endpointName,
    });
    if (response) {
      return response.publishers;
    } else {
      throwError(response);
    }
  }

  public deleteAll(assetId: string): Promise<void> {
    return connectRequest(this.connection, {
      method: 'DELETE',
      url: this.publishersUrl + assetId + '/' + this.endpointName,
    });
  }

  public delete(assetId: string, id: string): Promise<void> {
    return connectRequest(this.connection, {
      method: 'DELETE',
      url: this.publishersUrl + encodeURIComponent(assetId) + '/' + this.endpointName + '/' + encodeURIComponent(id),
    });
  }
}
