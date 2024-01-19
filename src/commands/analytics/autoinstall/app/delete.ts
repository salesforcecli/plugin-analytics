/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  SfCommand,
  Ux,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';

import AutoInstall, { type AutoInstallRequestType } from '../../../../lib/analytics/autoinstall/autoinstall.js';
import {
  DEF_APP_CREATE_UPDATE_TIMEOUT,
  DEF_POLLING_INTERVAL,
  MIN_POLLING_INTERVAL,
} from '../../../../lib/analytics/constants.js';
import { throwWithData } from '../../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

export default class Delete extends SfCommand<AutoInstallRequestType | string | undefined> {
  public static readonly summary = messages.getMessage('deleteCommandDescription');
  public static readonly description = messages.getMessage('deleteCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:autoinstall:app:delete -f folderid'];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    folderid: Flags.salesforceId({
      char: 'f',
      required: true,
      summary: messages.getMessage('folderidFlagDescription'),
      description: messages.getMessage('folderidFlagLongDescription'),
    }),
    async: Flags.boolean({
      char: 'a',
      summary: messages.getMessage('appDeleteAsyncDescription'),
      description: messages.getMessage('appDeleteAsyncLongDescription'),
    }),
    wait: Flags.integer({
      char: 'w',
      summary: messages.getMessage('autoInstallWaitDescription'),
      description: messages.getMessage('autoInstallWaitLongDescription', [DEF_APP_CREATE_UPDATE_TIMEOUT]),
      min: 0,
      default: DEF_APP_CREATE_UPDATE_TIMEOUT,
    }),
    pollinterval: Flags.integer({
      char: 'p',
      summary: messages.getMessage('autoInstallPollIntervalDescription'),
      description: messages.getMessage('autoInstallPollIntervalLongDescription', [DEF_POLLING_INTERVAL]),
      min: MIN_POLLING_INTERVAL,
      default: DEF_POLLING_INTERVAL,
    }),
  };

  public async run() {
    const { flags } = await this.parse(Delete);
    const autoinstall = new AutoInstall(flags['target-org'].getConnection(flags['api-version']));
    const autoInstallId = await autoinstall.delete(flags.folderid);
    if (flags.async || flags.wait <= 0) {
      this.log(messages.getMessage('appDeleteRequestSuccess', [autoInstallId]));
    } else if (autoInstallId) {
      // otherwise start polling the request
      const finalRequest = await autoinstall.pollRequest(autoInstallId, {
        timeoutMs: flags.wait * 60 * 1000,
        pauseMs: flags.pollinterval,
        timeoutMessage: (r) =>
          throwWithData(messages.getMessage('requestPollingTimeout', [autoInstallId, r?.requestStatus ?? '']), r),
        ux: new Ux({ jsonEnabled: this.jsonEnabled() }),
        startMesg: messages.getMessage('startRequestPolling', [autoInstallId]),
      });
      const status = finalRequest.requestStatus?.toLocaleLowerCase();
      if (status === 'success') {
        this.log(messages.getMessage('appDeleteSuccess', [finalRequest.folderId, autoInstallId]));
        return finalRequest;
      } else if (status === 'cancelled') {
        throwWithData(messages.getMessage('requestCancelled', [autoInstallId]), finalRequest);
      } else {
        throwWithData(messages.getMessage('appDeleteFailed', [autoInstallId]), finalRequest);
      }
    } else {
      // we should always get an auto-install-request id back, but fail if we don't
      throw new SfError(messages.getMessage('appDeleteFailed', ['']));
    }
    return autoInstallId;
  }
}
