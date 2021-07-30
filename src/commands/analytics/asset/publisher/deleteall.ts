/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import { cli } from 'cli-ux';

import Publisher from '../../../../lib/analytics/publisher/publisher';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'asset');

export default class Deleteall extends SfdxCommand {
  public static description = messages.getMessage('deleteallCommandDescription');
  public static longDescription = messages.getMessage('deleteallCommandLongDescription');

  public static examples = ['$ sfdx analytics:asset:publisher:deleteall -i assetId'];

  protected static flagsConfig = {
    assetid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('assetidFlagDescription'),
      longDescription: messages.getMessage('assetidFlagLongDescription')
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
    return this.flags.assetid as string;
  }

  private async executeCommand() {
    const publisher = new Publisher(this.org as Org);
    await publisher.deleteAll(this.flags.assetid as string);
    this.ux.log(messages.getMessage('deletePublishersSuccess', [this.flags.assetid]));
  }
}
