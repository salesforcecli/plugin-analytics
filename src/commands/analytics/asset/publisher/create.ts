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

export default class Create extends SfdxCommand {
  public static description = messages.getMessage('publisherCreateCommandDescription');
  public static longDescription = messages.getMessage('publisherCreateCommandLongDescription');

  public static examples = ['$ sfdx analytics:asset:publisher:create -i assetId'];

  protected static flagsConfig = {
    assetid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('assetidFlagDescription'),
      longDescription: messages.getMessage('assetidFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const publisher = new Publisher(this.org as Org);
    const assetId = this.flags.assetid as string;
    const developerId = await publisher.create(assetId);
    this.ux.log(messages.getMessage('createSuccess', [developerId]));
    return developerId;
  }
}
