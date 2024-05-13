/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request.js';
import { throwError } from '../utils.js';

export type AppStatus =
  | 'newstatus'
  | 'inprogressstatus'
  | 'failedstatus'
  | 'cancelledstatus'
  | 'dataflowinprogressstatus'
  | 'completedstatus';

export type AppFolder = Record<string, unknown> & {
  id: string;
  name?: string;
  namespace?: string;
  label?: string;
  applicationStatus?: AppStatus;
  appLog?: Array<{ message?: string }>;
  createdBy?: { id?: string; name?: string };
  createdDate?: string;
  lastModifiedBy?: { id?: string; name?: string };
  lastModifiedDate?: string;
  templateSourceId?: string;
  templateValues?: Record<string, unknown>;
  templateVersion?: string;
  templateOptions?: Record<string, unknown>;
};

export type CreateAppBody = {
  description?: string;
  label?: string;
  templateSourceId?: string;
  assetIcon?: string;
  templateValues?: Record<string, unknown>;
  name?: string;
  templateOptions?: {
    dynamicOptions?: Record<string, unknown>;
    appAction?: string;
    disableApex?: boolean;
  };
};

export default class Folder {
  public readonly serverVersion: number;
  private readonly foldersUrl: string;

  public constructor(private readonly connection: Connection) {
    this.foldersUrl = `${this.connection.baseUrl()}/wave/folders/`;
    this.serverVersion = +this.connection.getApiVersion();
  }

  public async fetch(folderid: string, includeLog = false): Promise<AppFolder> {
    const response = await connectRequest<AppFolder>(this.connection, {
      method: 'GET',
      url: this.foldersUrl + encodeURIComponent(folderid) + (includeLog ? '?filterGroup=Supplemental' : ''),
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }

  public async create(body: CreateAppBody): Promise<string | undefined> {
    if (this.serverVersion >= 55.0 && body.templateSourceId) {
      if (!body.templateOptions) {
        // eslint-disable-next-line no-param-reassign
        body = {
          ...body,
          templateOptions: { dynamicOptions: { productionType: 'ATF_3_0', runtimeLogEntryLevel: 'Warning' } },
        };
      } else if (!body.templateOptions.dynamicOptions) {
        // eslint-disable-next-line no-param-reassign
        body.templateOptions = {
          ...body.templateOptions,
          dynamicOptions: { productionType: 'ATF_3_0', runtimeLogEntryLevel: 'Warning' },
        };
      }
    }
    const response = await connectRequest<AppFolder>(this.connection, {
      method: 'POST',
      url: this.foldersUrl,
      body: JSON.stringify(body),
    });
    if (response) {
      return response.id;
    } else {
      throwError(response);
    }
  }

  public async update(folderid: string, templateid: string): Promise<string | undefined> {
    let body = JSON.stringify({ templateSourceId: templateid, templateOptions: { appAction: 'Upgrade' } });
    if (this.serverVersion >= 55.0) {
      body = JSON.stringify({
        templateSourceId: templateid,
        templateOptions: {
          appAction: 'Upgrade',
          dynamicOptions: { productionType: 'ATF_3_0', runtimeLogEntryLevel: 'Warning' },
        },
      });
    }
    const wtUrl = this.foldersUrl + encodeURIComponent(folderid);
    const response = await connectRequest<AppFolder>(this.connection, {
      method: 'PUT',
      url: wtUrl,
      body,
    });

    if (response) {
      return response.id;
    } else {
      throwError(response);
    }
  }

  public async decouple(folderid: string, templateid: string): Promise<string | undefined> {
    const body = JSON.stringify({
      templateSourceId: templateid,
      templateOptions: { appAction: 'DecoupleApp' },
    });
    const wtUrl = this.foldersUrl + encodeURIComponent(folderid);
    const response = await connectRequest<AppFolder>(this.connection, {
      method: 'PUT',
      url: wtUrl,
      body,
    });

    if (response) {
      return response.id;
    } else {
      throwError(response);
    }
  }

  public list(): Promise<AppFolder[]> {
    return fetchAllPages<AppFolder>(this.connection, this.foldersUrl, 'folders');
  }

  public async deleteFolder(folderid: string): Promise<void> {
    const folderUrl = this.foldersUrl + folderid;
    await connectRequest(this.connection, {
      method: 'DELETE',
      url: folderUrl,
    });
  }
}
