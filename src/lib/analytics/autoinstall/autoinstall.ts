/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Connection, Messages } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request.js';
import { CommandUx, generateTableColumns, headerColor, throwError, waitFor } from '../utils.js';

export type AutoInstallStatus =
  | 'New'
  | 'Enqueued'
  | 'Cancelled'
  | 'Skipped'
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
  dynamicOptions?: Map<string, object>;
  values?: Map<string, object>;
  failOnDuplicateNames?: boolean;
  autoShareWithLicensedUsers?: boolean;
  autoShareWithOriginator?: boolean;
  deleteAppOnConstructionFailure?: boolean;
  dataRefreshSchedule?: {
    daysOfWeek?: [];
    frequency?: string;
    time?: {
      hour?: number;
      minute?: number;
      timezone?: {
        zoneId?: string;
      };
    };
  };
};

function isFinishedRequest(r: AutoInstallRequestType): boolean {
  const status = r.requestStatus?.toLocaleLowerCase();
  return status === 'cancelled' || status === 'success' || status === 'failed' || status === 'skipped';
}

const newStatus = 'New';
const enqueuedStatus = 'Enqueued';
const createType = 'WaveAppCreate';
const updateType = 'WaveAppUpdate';
const deleteType = 'WaveAppDelete';
const cancelStatusType = 'Cancelled';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

export function logAppLog(autoinstallRep: AutoInstallRequestType, ux: CommandUx) {
  ux.styledHeader(headerColor(messages.getMessage('displayLogHeader')));
  if (
    !autoinstallRep.appFromRequest?.appLog ||
    !Array.isArray(autoinstallRep.appFromRequest?.appLog) ||
    autoinstallRep.appFromRequest.appLog.length <= 0
  ) {
    ux.log(messages.getMessage('displayNoLogAvailable'));
  } else {
    const data = autoinstallRep.appFromRequest.appLog?.map((line) => ({
      message: (typeof line === 'string' ? line : line.message) || '',
    }));
    ux.table(data, generateTableColumns(['message']));
  }
}

export default class AutoInstall {
  public readonly serverVersion: number;
  private readonly autoInstallUrl: string;

  public constructor(private readonly connection: Connection) {
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
      predicate = isFinishedRequest,
    }: {
      timeoutMs: number;
      pauseMs: number;
      timeoutMessage: string | ((r: AutoInstallRequestType | undefined) => string | Error | never);
      ux?: CommandUx;
      showSpinner?: boolean;
      startMesg?: string;
      predicate?: (r: AutoInstallRequestType) => boolean;
    }
  ): Promise<AutoInstallRequestType> {
    if (showSpinner && startMesg) {
      ux?.spinner.start(startMesg);
    } else if (startMesg) {
      ux?.log(startMesg);
    }
    let result: AutoInstallRequestType;
    try {
      result = await waitFor(() => this.fetch(autoInstallId), predicate, { pauseMs, timeoutMs, timeoutMessage });
    } finally {
      if (showSpinner && startMesg) {
        ux?.spinner.stop();
      }
    }
    return result;
  }

  public async fetch(autoinstallid: string): Promise<AutoInstallRequestType> {
    const response: AutoInstallRequestType = await connectRequest(this.connection, {
      method: 'GET',
      url: this.autoInstallUrl + encodeURIComponent(autoinstallid) + '?filterGroup=Supplemental',
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
        appConfiguration,
      },
    });
    return this.performPost(body);
  }

  public update(templateApiName: string, folderId: string): Promise<string | undefined> {
    const body = JSON.stringify({
      templateApiName,
      folderId,
      requestStatus: enqueuedStatus,
      requestType: updateType,
    });
    return this.performPost(body);
  }

  public delete(folderId: string): Promise<string | undefined> {
    const body = JSON.stringify({
      folderId,
      requestStatus: enqueuedStatus,
      requestType: deleteType,
    });
    return this.performPost(body);
  }

  public enable(): Promise<string | undefined> {
    const body = JSON.stringify({
      requestStatus: enqueuedStatus,
      requestType: 'WaveEnable',
    });
    return this.performPost(body);
  }

  public async cancel(autoinstallid: string): Promise<string | undefined> {
    const body = JSON.stringify({
      requestStatus: cancelStatusType,
    });

    const response = await connectRequest<AutoInstallRequestType>(this.connection, {
      method: 'PATCH',
      url: this.autoInstallUrl + encodeURIComponent(autoinstallid),
      body,
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
      body,
    });
    if (response) {
      return response.id;
    } else {
      throwError(response);
    }
  }
}
