/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand, Ux, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';

import AutoInstall, { AutoInstallRequestType } from '../../lib/analytics/autoinstall/autoinstall.js';
import {
  DEF_APP_CREATE_UPDATE_TIMEOUT,
  DEF_POLLING_INTERVAL,
  MIN_POLLING_INTERVAL,
} from '../../lib/analytics/constants.js';
import { throwWithData } from '../../lib/analytics/utils.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

export default class Enable extends SfCommand<AutoInstallRequestType | string | undefined> {
  public static readonly summary = messages.getMessage('enableCommandDescription');
  public static readonly description = messages.getMessage('enableCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:enable'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    async: Flags.boolean({
      char: 'a',
      summary: messages.getMessage('enableAsyncDescription'),
      description: messages.getMessage('enableAsyncLongDescription'),
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
    const { flags } = await this.parse(Enable);
    const autoinstall = new AutoInstall(flags.targetOrg);
    const autoInstallId = await autoinstall.enable();
    // they did't enqueue or said they don't want to wait, so just return now
    if (flags.noenqueue || flags.async || flags.wait <= 0) {
      this.log(messages.getMessage('enableRequestSuccess', [autoInstallId]));
      return autoInstallId;
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
        this.log(messages.getMessage('enableSuccess', [autoInstallId]));
        return finalRequest;
      } else if (status === 'cancelled') {
        throwWithData(messages.getMessage('requestCancelled', [autoInstallId]), finalRequest);
      } else {
        throwWithData(messages.getMessage('enableFailed', [autoInstallId]), finalRequest);
      }
    } else {
      // we should always get an auto-install-request id back, but fail if we don't
      throw new SfError(messages.getMessage('enableFailed', ['']));
    }
  }
}
