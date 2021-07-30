/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Folder from '../../../lib/analytics/app/folder';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export default class Update extends SfdxCommand {
  public static description = messages.getMessage('updateCommandDescription');
  public static longDescription = messages.getMessage('updateCommandLongDescription');

  public static examples = ['$ sfdx analytics:app:update -f folderId -t templateId'];

  protected static flagsConfig = {
    templateid: flags.id({
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
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const folder = new Folder(this.org as Org);
    const waveAppId = await folder.update(this.flags.folderid, this.flags.templateid);
    // If error occurs here fails out in the update call and reports back, otherwise success
    this.ux.log(messages.getMessage('updateSuccess', [waveAppId]));
    return waveAppId;
  }
}
