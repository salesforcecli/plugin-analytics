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

export default class Update extends SfCommand<AutoInstallRequestType | string | undefined> {
  public static readonly summary = messages.getMessage('updateCommandDescription');
  public static readonly description = messages.getMessage('updateCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:autoinstall:app:update -t templateid -f folderid',
    '$ sfdx analytics:autoinstall:app:update -n templatename -f folderid',
  ];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    templateid: Flags.salesforceId({
      char: 't',
      summary: messages.getMessage('templateidFlagDescription'),
      description: messages.getMessage('templateidFlagLongDescription'),
      exclusive: ['templatename'],
    }),
    templatename: Flags.string({
      char: 'n',
      summary: messages.getMessage('templatenameFlagDescription'),
      description: messages.getMessage('templatenameFlagLongDescription'),
      exclusive: ['templateid'],
    }),
    folderid: Flags.salesforceId({
      char: 'f',
      required: true,
      summary: messages.getMessage('folderidFlagDescription'),
      description: messages.getMessage('folderidFlagLongDescription'),
    }),
    async: Flags.boolean({
      char: 'a',
      summary: messages.getMessage('appUpdateAsyncDescription'),
      description: messages.getMessage('appUpdateAsyncLongDescription'),
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
    const { flags } = await this.parse(Update);
    const templateInput = (flags.templateid ?? flags.templatename) as string;
    if (!templateInput) {
      throw new SfError(messages.getMessage('missingRequiredField'));
    }
    const autoinstall = new AutoInstall(flags['target-org'].getConnection(flags['api-version']));
    const autoInstallId = await autoinstall.update(templateInput, flags.folderid);
    if (flags.async || flags.wait <= 0) {
      this.log(messages.getMessage('appUpdateRequestSuccess', [autoInstallId]));
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
        this.log(messages.getMessage('appUpdateSuccess', [finalRequest.folderId, autoInstallId]));
        return finalRequest;
      } else if (status === 'cancelled') {
        throwWithData(messages.getMessage('requestCancelled', [autoInstallId]), finalRequest);
      } else {
        throwWithData(messages.getMessage('appUpdateFailed', [autoInstallId]), finalRequest);
      }
    } else {
      // we should always get an auto-install-request id back, but fail if we don't
      throw new SfError(messages.getMessage('appUpdateFailed', ['']));
    }
    return autoInstallId;
  }
}
