/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Connection } from '@salesforce/core';
import { connectRequest } from '../request.js';
import { throwError } from '../utils.js';

export type ValidateType = Record<string, unknown> & {
  id?: string;
  tasks?: Tasks[];
};

export type Tasks = {
  label?: string | null;
  message?: string | null;
  readinessStatus?: string | null;
};

export default class TemplateValidate {
  public readonly serverVersion: number;
  private readonly templatesUrl: string;

  public constructor(private readonly connection: Connection) {
    this.templatesUrl = `${this.connection.baseUrl()}/wave/templates/`;
    this.serverVersion = +this.connection.getApiVersion();
  }

  public appliesToThisServerVersion(): boolean {
    return this.serverVersion >= 58.0;
  }

  public async run(templateNameOrId: string, inputBody: unknown): Promise<ValidateType> {
    const body = inputBody ? JSON.stringify(inputBody) : '{}';
    const response = await connectRequest<ValidateType>(this.connection, {
      method: 'POST',
      url: this.templatesUrl + encodeURIComponent(templateNameOrId) + '/validate',
      body,
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }
}
