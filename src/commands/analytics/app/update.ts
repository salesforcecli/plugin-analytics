/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  SfCommand,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { DEF_APP_CREATE_UPDATE_TIMEOUT } from '../../../lib/analytics/constants.js';
import AppStreaming, { type StreamingResult } from '../../../lib/analytics/event/appStreaming.js';

import Folder from '../../../lib/analytics/app/folder.js';
import { CommandUx, commandUx } from '../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export default class Update extends SfCommand<{ id?: string; events?: StreamingResult[] }> {
  public static readonly summary = messages.getMessage('updateCommandDescription');
  public static readonly description = messages.getMessage('updateCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:app:update -f folderId -t templateId'];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    templateid: Flags.string({
      char: 't',
      required: true,
      summary: messages.getMessage('templateidForUpdateFlagDescription'),
      description: messages.getMessage('templateidForUpdateFlagLongDescription'),
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
    allevents: Flags.boolean({
      char: 'v',
      summary: messages.getMessage('appCreateAllEventsDescription'),
      description: messages.getMessage('appCreateAllEventsLongDescription'),
    }),
    wait: Flags.integer({
      char: 'w',
      summary: messages.getMessage('streamingWaitDescription'),
      description: messages.getMessage('streamingWaitLongDescription', [DEF_APP_CREATE_UPDATE_TIMEOUT]),
      min: 0,
      default: DEF_APP_CREATE_UPDATE_TIMEOUT,
    }),
  };

  public async run() {
    const { flags } = await this.parse(Update);
    const folder = new Folder(flags['target-org'].getConnection(flags['api-version']));
    if (flags.async || flags.wait <= 0) {
      const waveAppId = await folder.update(flags.folderid, flags.templateid);
      // If error occurs here fails out in the update call and reports back, otherwise success
      this.log(messages.getMessage('updateSuccess', [waveAppId]));
      return { id: waveAppId };
    } else {
      const ux: CommandUx = commandUx(this);
      const appStreaming = new AppStreaming(flags['target-org'], flags.allevents, flags.wait, ux);
      const waveAppId = await appStreaming.streamUpdateEvent(folder, flags.folderid, flags.templateid);
      return { id: waveAppId, events: appStreaming.getStreamingResults() };
    }
  }
}
