/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';

import AutoInstall from '../../lib/analytics/autoinstall/autoinstall';
import { DEF_APP_CREATE_TIMEOUT, DEF_POLLING_INTERVAL, MIN_POLLING_INTERVAL } from '../../lib/analytics/constants';
import { throwWithData } from '../../lib/analytics/utils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

export default class Enable extends SfdxCommand {
  public static description = messages.getMessage('enableCommandDescription');
  public static longDescription = messages.getMessage('enableCommandLongDescription');

  public static examples = ['$ sfdx analytics:enable'];

  protected static flagsConfig = {
    async: flags.boolean({
      char: 'a',
      description: messages.getMessage('enableAsyncDescription'),
      longDescription: messages.getMessage('enableAsyncLongDescription')
    }),
    wait: flags.number({
      char: 'w',
      description: messages.getMessage('autoInstallWaitDescription'),
      longDescription: messages.getMessage('autoInstallWaitLongDescription', [DEF_APP_CREATE_TIMEOUT]),
      min: 0,
      default: DEF_APP_CREATE_TIMEOUT
    }),
    pollinterval: flags.number({
      char: 'p',
      description: messages.getMessage('autoInstallPollIntervalDescription'),
      longDescription: messages.getMessage('autoInstallPollIntervalLongDescription', [DEF_POLLING_INTERVAL]),
      min: MIN_POLLING_INTERVAL,
      default: DEF_POLLING_INTERVAL
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const autoinstall = new AutoInstall(this.org as Org);
    const autoInstallId = await autoinstall.enable();
    // they did't enqueue or said they don't want to wait, so just return now
    if (this.flags.noenqueue || this.flags.async || this.flags.wait <= 0) {
      this.ux.log(messages.getMessage('enableRequestSuccess', [autoInstallId]));
      return autoInstallId;
    } else if (autoInstallId) {
      // otherwise start polling the request
      const finalRequest = await autoinstall.pollRequest(autoInstallId, {
        timeoutMs: this.flags.wait * 60 * 1000,
        pauseMs: this.flags.pollinterval as number,
        timeoutMessage: r =>
          throwWithData(messages.getMessage('requestPollingTimeout', [autoInstallId, r?.requestStatus || '']), r),
        ux: this.ux,
        startMesg: messages.getMessage('startRequestPolling', [autoInstallId])
      });
      const status = finalRequest.requestStatus?.toLocaleLowerCase();
      if (status === 'success') {
        this.ux.log(messages.getMessage('enableSuccess', [autoInstallId]));
        return finalRequest;
      } else if (status === 'cancelled') {
        throwWithData(messages.getMessage('requestCancelled', [autoInstallId]), finalRequest);
      } else {
        throwWithData(messages.getMessage('enableFailed', [autoInstallId]), finalRequest);
      }
    } else {
      // we should always get an auto-install-request id back, but fail if we don't
      throw new SfdxError(messages.getMessage('enableFailed', ['']));
    }
  }
}
