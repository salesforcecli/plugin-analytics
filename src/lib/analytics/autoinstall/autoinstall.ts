/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { UX } from '@salesforce/command';
import { Connection, Org } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request';
import { throwError, waitFor } from '../utils';

export type AutoInstallStatus =
  | 'New'
  | 'Enqueued'
  | 'Cancelled'
  | 'InProgress'
  | 'AppInProgress'
  | 'Success'
  | 'Failed';

export type AutoInstallRequestType = Record<string, unknown> & {
  id?: string;
  requestType?: string;
  requestName?: string;
  requestStatus?: AutoInstallStatus;
  templateApiName?: string;
  folderId?: string;
  folderLabel?: string;
  templateVersion?: string;
  requestTemplate?: {
    description?: string;
    label?: string;
    namespace?: string;
    assetVersion?: string;
    templateType?: string;
  };
  createdBy?: {
    id?: string;
    name?: string;
  };
  createdDate?: string;
  lastModifiedBy?: {
    id?: string;
    name?: string;
  };
  lastModifiedDate?: string;
  appFromRequest?: {
    appLog?: Array<string | { message: string }>;
  };
};

export type AutoInstallCreateAppConfigurationBody = {
  appName?: string;
  appLabel?: string;
  appDescription?: string;
};

function isFinishedRequest(r: AutoInstallRequestType): boolean {
  const status = r.requestStatus?.toLocaleLowerCase();
  return status === 'cancelled' || status === 'success' || status === 'failed';
}

const newStatus = 'New';
const enqueuedStatus = 'Enqueued';
const createType = 'WaveAppCreate';
const updateType = 'WaveAppUpdate';
const deleteType = 'WaveAppDelete';
const cancelType = 'Cancelled';

export default class AutoInstall {
  public readonly serverVersion: number;
  private readonly connection: Connection;
  private readonly autoInstallUrl: string;

  public constructor(organization: Org) {
    this.connection = organization.getConnection();
    this.serverVersion = +this.connection.getApiVersion();
    this.autoInstallUrl = `${this.connection.baseUrl()}/wave/auto-install-requests/`;
  }

  public async pollRequest(
    autoInstallId: string,
    {
      timeoutMs,
      pauseMs,
      timeoutMessage,
      ux,
      showSpinner = true,
      startMesg,
      predicate = isFinishedRequest
    }: {
      timeoutMs: number;
      pauseMs: number;
      timeoutMessage: string | ((r: AutoInstallRequestType | undefined) => string | Error | never);
      ux?: UX;
      showSpinner?: boolean;
      startMesg?: string;
      predicate?: (r: AutoInstallRequestType) => boolean;
    }
  ): Promise<AutoInstallRequestType> {
    if (showSpinner && startMesg) {
      ux?.startSpinner(startMesg);
    } else if (startMesg) {
      ux?.log(startMesg);
    }
    let result: AutoInstallRequestType;
    try {
      result = await waitFor(() => this.fetch(autoInstallId), predicate, { pauseMs, timeoutMs, timeoutMessage });
    } finally {
      if (showSpinner && startMesg) {
        ux?.stopSpinner();
      }
    }
    return result;
  }

  public async fetch(autoinstallid: string): Promise<AutoInstallRequestType> {
    const response: AutoInstallRequestType = await connectRequest(this.connection, {
      method: 'GET',
      url: this.autoInstallUrl + encodeURIComponent(autoinstallid) + '?filterGroup=Supplemental'
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }

  public list(): Promise<AutoInstallRequestType[]> {
    // /wave/auto-install-requests doesn't (yet) support actual pagination so just request the largest max pagesize, and
    // this will end up just returning that first GET's worth of items (until the server starts returning a nextPageUrl,
    // in which case this will start paginating)
    return fetchAllPages<AutoInstallRequestType>(this.connection, this.autoInstallUrl + '?pageSize=200', 'requests');
  }

  public create(
    templateApiName: string,
    appConfiguration: AutoInstallCreateAppConfigurationBody,
    enqueue = true
  ): Promise<string | undefined> {
    const body = JSON.stringify({
      templateApiName,
      requestStatus: enqueue ? enqueuedStatus : newStatus,
      requestType: createType,
      configuration: {
        appConfiguration
      }
    });
    return this.performPost(body);
  }

  public update(templateApiName: string, folderId: string): Promise<string | undefined> {
    const body = JSON.stringify({
      templateApiName,
      folderId,
      requestStatus: enqueuedStatus,
      requestType: updateType
    });
    return this.performPost(body);
  }

  public delete(folderId: string): Promise<string | undefined> {
    const body = JSON.stringify({
      folderId,
      requestStatus: enqueuedStatus,
      requestType: deleteType
    });
    return this.performPost(body);
  }

  public enable(): Promise<string | undefined> {
    const body = JSON.stringify({
      requestStatus: enqueuedStatus,
      requestType: 'WaveEnable'
    });
    return this.performPost(body);
  }

  public async cancel(autoinstallid: string): Promise<string | undefined> {
    const body = JSON.stringify({
      requestStatus: cancelType
    });

    const response = await connectRequest<AutoInstallRequestType>(this.connection, {
      method: 'PATCH',
      url: this.autoInstallUrl + encodeURIComponent(autoinstallid),
      body
    });
    if (response) {
      return response.id;
    } else {
      throwError(response);
    }
  }

  private async performPost(body: string): Promise<string | undefined> {
    const response = await connectRequest<AutoInstallRequestType>(this.connection, {
      method: 'POST',
      url: this.autoInstallUrl,
      body
    });
    if (response) {
      return response.id;
    } else {
      throwError(response);
    }
  }
}
