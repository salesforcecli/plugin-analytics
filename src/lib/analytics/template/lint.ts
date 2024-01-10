/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Connection, Org } from '@salesforce/core';
import { connectRequest } from '../request.js';
import { throwError } from '../utils.js';

export type LintType = Record<string, unknown> & {
  label?: string;
  score?: number;
  tasks?: Tasks[];
};

export type Tasks = {
  label?: string | null;
  message?: string | null;
  readinessStatus?: string | null;
};

export default class TemplateLint {
  public readonly serverVersion: number;
  private readonly connection: Connection;
  private readonly templatesUrl: string;

  public constructor(organization: Org) {
    this.connection = organization.getConnection();
    this.templatesUrl = `${this.connection.baseUrl()}/wave/templates/`;
    this.serverVersion = +this.connection.getApiVersion();
  }

  public appliesToThisServerVersion(): boolean {
    return this.serverVersion >= 58.0;
  }

  public async run(templateNameOrId: string): Promise<LintType> {
    const body = '{}';
    const response = await connectRequest<LintType>(this.connection, {
      method: 'PUT',
      url: this.templatesUrl + encodeURIComponent(templateNameOrId) + '/lint',
      body,
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }
}
