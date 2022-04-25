/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import { DEF_APP_CREATE_UPDATE_TIMEOUT } from '../../../lib/analytics/constants';
import AppStreaming from '../../../lib/analytics/event/appStreaming';

import Folder from '../../../lib/analytics/app/folder';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export default class Update extends SfdxCommand {
  public static description = messages.getMessage('updateCommandDescription');
  public static longDescription = messages.getMessage('updateCommandLongDescription');

  public static examples = ['$ sfdx analytics:app:update -f folderId -t templateId'];

  protected static flagsConfig = {
    templateid: flags.string({
      char: 't',
      required: true,
      description: messages.getMessage('templateidForUpdateFlagDescription'),
      longDescription: messages.getMessage('templateidForUpdateFlagLongDescription')
    }),
    folderid: flags.id({
      char: 'f',
      required: true,
      description: messages.getMessage('folderidFlagDescription'),
      longDescription: messages.getMessage('folderidFlagLongDescription')
    }),
    async: flags.boolean({
      char: 'a',
      description: messages.getMessage('appUpdateAsyncDescription'),
      longDescription: messages.getMessage('appUpdateAsyncLongDescription')
    }),
    allevents: flags.boolean({
      char: 'v',
      description: messages.getMessage('appCreateAllEventsDescription'),
      longDescription: messages.getMessage('appCreateAllEventsLongDescription')
    }),
    wait: flags.number({
      char: 'w',
      description: messages.getMessage('streamingWaitDescription'),
      longDescription: messages.getMessage('streamingWaitLongDescription', [DEF_APP_CREATE_UPDATE_TIMEOUT]),
      min: 0,
      default: DEF_APP_CREATE_UPDATE_TIMEOUT
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const folder = new Folder(this.org as Org);
    const appStreaming = new AppStreaming(
      this.org as Org,
      this.flags.allEvents as boolean,
      this.flags.wait as number,
      this.ux
    );
    if (this.flags.async || this.flags.wait <= 0) {
      const waveAppId = await folder.update(this.flags.folderid as string, this.flags.templateid as string);
      // If error occurs here fails out in the update call and reports back, otherwise success
      this.ux.log(messages.getMessage('updateSuccess', [waveAppId]));
      return { id: waveAppId };
    } else {
      const waveAppId = await appStreaming.streamUpdateEvent(
        folder,
        this.flags.folderid as string,
        this.flags.templateid as string
      );
      return { id: waveAppId, events: appStreaming.getStreamingResults() };
    }
  }
}
