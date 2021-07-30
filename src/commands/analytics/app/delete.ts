/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import { cli } from 'cli-ux';

import Folder from '../../../lib/analytics/app/folder';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export default class Delete extends SfdxCommand {
  public static description = messages.getMessage('deleteCommandDescription');
  public static longDescription = messages.getMessage('deleteCommandLongDescription');

  public static examples = ['$ sfdx analytics:app:delete -f folderid'];

  protected static flagsConfig = {
    folderid: flags.id({
      char: 'f',
      required: true,
      description: messages.getMessage('folderidFlagDescription'),
      longDescription: messages.getMessage('folderidFlagLongDescription')
    }),
    noprompt: flags.boolean({
      char: 'p',
      description: messages.getMessage('nopromptFlagDescription'),
      longDescription: messages.getMessage('nopromptFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    if (this.flags.noprompt) {
      await this.executeCommand();
    } else {
      const answer = (await cli.prompt(messages.getMessage('confirmDeleteYesNo'))) as string;
      if (answer.toUpperCase() === 'YES' || answer.toUpperCase() === 'Y') {
        await this.executeCommand();
      }
    }
    return this.flags.folderid as string;
  }

  private async executeCommand(): Promise<void> {
    const folder = new Folder(this.org as Org);
    await folder.deleteFolder(this.flags.folderid);
    this.ux.log(messages.getMessage('deleteAppSuccess', [this.flags.folderid]));
  }
}
