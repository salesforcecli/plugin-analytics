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

export default class Decouple extends SfdxCommand {
  public static description = messages.getMessage('decoupleCommandDescription');
  public static longDescription = messages.getMessage('decoupleCommandLongDescription');

  public static examples = ['$ sfdx analytics:app:decouple -f folderId -t templateId'];

  protected static flagsConfig = {
    folderid: flags.id({
      char: 'f',
      required: true,
      description: messages.getMessage('folderidFlagDescription'),
      longDescription: messages.getMessage('folderidFlagLongDescription')
    }),
    templateid: flags.id({
      char: 't',
      required: true,
      description: messages.getMessage('templateidFlagDescription'),
      longDescription: messages.getMessage('templateidFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const folder = new Folder(this.org as Org);
    const folderId = await folder.decouple(this.flags.folderid, this.flags.templateid);
    // If error occurs here fails out in the decouple call and reports back, otherwise success
    this.ux.log(messages.getMessage('decoupleSuccess', [folderId, this.flags.templateid]));
    return folderId;
  }
}
