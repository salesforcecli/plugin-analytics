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

import AutoInstall, {
  type AutoInstallCreateAppConfigurationBody,
  type AutoInstallRequestType,
} from '../../../../lib/analytics/autoinstall/autoinstall.js';
import {
  DEF_APP_CREATE_UPDATE_TIMEOUT,
  DEF_POLLING_INTERVAL,
  MIN_POLLING_INTERVAL,
} from '../../../../lib/analytics/constants.js';
import { fs, throwWithData } from '../../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

export default class Create extends SfCommand<AutoInstallRequestType | { id: string }> {
  public static readonly summary = messages.getMessage('createCommandDescription');
  public static readonly description = messages.getMessage('createCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:autoinstall:app:create -t templateid',
    '$ sfdx analytics:autoinstall:app:create -n templatename',
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
    appname: Flags.string({
      summary: messages.getMessage('appnameFlagDescription'),
      description: messages.getMessage('appnameFlagLongDescription'),
    }),
    appdescription: Flags.string({
      summary: messages.getMessage('appdescriptionFlagDescription'),
      description: messages.getMessage('appdescriptionFlagLongDescription'),
    }),
    appconfiguration: Flags.file({
      char: 'c',
      summary: messages.getMessage('appConfigFileFlagDescription'),
      description: messages.getMessage('appConfigFileFlagLongDescription'),
      exclusive: ['appname', 'appdescription'],
    }),
    noenqueue: Flags.boolean({
      summary: messages.getMessage('noenqueueFlagDescription'),
      description: messages.getMessage('noenqueueFlagLongDescription'),
      hidden: true,
    }),
    async: Flags.boolean({
      char: 'a',
      summary: messages.getMessage('appCreateAsyncDescription'),
      description: messages.getMessage('appCreateAsyncLongDescription'),
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
    const { flags } = await this.parse(Create);
    const templateInput = (flags.templateid ?? flags.templatename) as string;
    if (!templateInput) {
      throw new SfError(messages.getMessage('missingRequiredField'));
    }

    const autoinstall = new AutoInstall(flags['target-org'].getConnection(flags['api-version']));

    const defaultAppConfiguration: AutoInstallCreateAppConfigurationBody = {
      appName: flags.appname,
      appLabel: flags.appname,
      appDescription: flags.appdescription,
    };

    let json: unknown;
    let fileAppConfiguration: unknown;
    if (flags.appconfiguration) {
      const path = flags.appconfiguration;
      try {
        json = JSON.parse(await fs.readFile(path));
      } catch (e) {
        throw new SfError(
          `Error parsing ${path}`,
          undefined,
          undefined,
          undefined,
          e instanceof Error ? e : new Error(e ? String(e) : '<unknown>')
        );
      }
      if (typeof json !== 'object') {
        throw new SfError(`Invalid json in ${path}, expected an object, found a ${typeof json}`);
      }
    }
    if (json) {
      fileAppConfiguration = json;
    }

    const autoInstallId = await autoinstall.create(
      templateInput,
      fileAppConfiguration ? fileAppConfiguration : defaultAppConfiguration,
      !flags.noenqueue
    );

    // they did't enqueue or said they don't want to wait, so just return now
    if (flags.noenqueue || flags.async || flags.wait <= 0) {
      this.log(messages.getMessage('appCreateRequestSuccess', [autoInstallId]));
      return { id: autoInstallId };
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
        this.log(messages.getMessage('appCreateSuccess', [finalRequest.folderId, autoInstallId]));
        return finalRequest;
      } else if (status === 'cancelled') {
        throwWithData(messages.getMessage('requestCancelled', [autoInstallId]), finalRequest);
      } else if (status === 'skipped') {
        throwWithData(messages.getMessage('requestSkipped', [autoInstallId]), finalRequest);
      } else {
        throwWithData(messages.getMessage('appCreateFailed', [autoInstallId]), finalRequest);
      }
    } else {
      // we should always get an auto-install-request id back, but fail if we don't
      throw new SfError(messages.getMessage('appCreateFailed', ['']));
    }
  }
}
