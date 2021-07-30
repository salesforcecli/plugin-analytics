/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Publisher from '../../../../lib/analytics/publisher/publisher';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'asset');

export default class Deleteall extends SfdxCommand {
  public static description = messages.getMessage('deleteCommandDescription');
  public static longDescription = messages.getMessage('deleteCommandLongDescription');

  public static examples = ['$ sfdx analytics:asset:publisher:delete -a assetId -i assetPublisherId'];

  protected static flagsConfig = {
    id: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('assetPublisheridFlagDescription'),
      longDescription: messages.getMessage('assetPublisheridFlagLongDescription')
    }),
    assetid: flags.id({
      char: 'a',
      required: true,
      description: messages.getMessage('assetidFlagDescription'),
      longDescription: messages.getMessage('assetidFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const publisher = new Publisher(this.org as Org);
    await publisher.delete(this.flags.assetid as string, this.flags.id as string);
    this.ux.log(messages.getMessage('deletePublisherSuccess', [this.flags.id]));
  }
}
