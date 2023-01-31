/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, Org } from '@salesforce/core';
import { Tokens } from '@salesforce/core/lib/messages';
import { connectRequest } from '../request';
import { throwError } from '../utils';

export type AuthType = {
  orgId: string;
  tenant: string;
};

export type CreateResults = {
  dataOrgId: string;
  orgId: string;
  action: string;
  dataOrgInstance: string;
  tenant: string;
  result: string;
  token: Tokens;
};

export default class CdpAuth {
  private readonly connection: Connection;
  private readonly cdpUrl: string;

  public constructor(organization: Org) {
    this.connection = organization.getConnection();
    this.cdpUrl = `${this.connection.baseUrl()}/wave/cdp/site/trust`;
  }

  public async fetch(): Promise<AuthType> {
    const response = await connectRequest<AuthType>(this.connection, {
      method: 'GET',
      url: this.cdpUrl
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }

  public async create(action: string, dataOrgId: string, dataOrgInstance: string): Promise<CreateResults> {
    const body = JSON.stringify({
      action,
      dataOrgId,
      dataOrgInstance
    });

    const response = await connectRequest<CreateResults>(this.connection, {
      method: 'POST',
      url: this.cdpUrl,
      body
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }

  public async establishTrust(
    action: string,
    dataOrgUsername: string,
    dataOrgPassword: string | undefined,
    tenant: string,
    jwtToken: string,
    accessToken: string | undefined
  ): Promise<CreateResults> {
    const body = JSON.stringify({
      action,
      dataOrgUsername,
      dataOrgPassword,
      tenant,
      jwtToken,
      accessToken
    });

    const response = await connectRequest<CreateResults>(this.connection, {
      method: 'POST',
      url: this.cdpUrl,
      body
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }
}
