/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, Org } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request';
import { throwError } from '../utils';

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
};

export type CreateAppBody = {
  description?: string;
  label?: string;
  templateSourceId?: string;
  assetIcon?: string;
  templateValues?: Record<string, unknown>;
  name?: string;
};

export default class Folder {
  private readonly connection: Connection;
  private readonly foldersUrl: string;

  public constructor(organization: Org) {
    this.connection = organization.getConnection();
    this.foldersUrl = `${this.connection.baseUrl()}/wave/folders/`;
  }

  public async fetch(folderid: string, includeLog = false): Promise<AppFolder> {
    const response = await connectRequest<AppFolder>(this.connection, {
      method: 'GET',
      url: this.foldersUrl + encodeURIComponent(folderid) + (includeLog ? '?filterGroup=Supplemental' : '')
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }

  public async create(body: CreateAppBody): Promise<string | undefined> {
    const response = await connectRequest<AppFolder>(this.connection, {
      method: 'POST',
      url: this.foldersUrl,
      body: JSON.stringify(body)
    });
    if (response) {
      return response.id;
    } else {
      throwError(response);
    }
  }

  public async update(folderid: string, templateid: string): Promise<string | undefined> {
    const body = JSON.stringify({ templateSourceId: templateid, templateOptions: { appAction: 'Upgrade' } });
    const wtUrl = this.foldersUrl + encodeURIComponent(folderid);
    const response = await connectRequest<AppFolder>(this.connection, {
      method: 'PUT',
      url: wtUrl,
      body
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
      templateOptions: { appAction: 'DecoupleApp' }
    });
    const wtUrl = this.foldersUrl + encodeURIComponent(folderid);
    const response = await connectRequest<AppFolder>(this.connection, {
      method: 'PUT',
      url: wtUrl,
      body
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
      url: folderUrl
    });
  }
}