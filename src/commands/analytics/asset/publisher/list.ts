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

export default class List extends SfdxCommand {
  public static description = messages.getMessage('publisherListCommandDescription');
  public static longDescription = messages.getMessage('publisherListCommandLongDescription');

  public static examples = ['$ sfdx analytics:asset:publisher:list -i assetId'];

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

  protected static tableColumnData = ['id', 'assetid', 'publisheruser', 'publisheruserid'];

  public async run() {
    const publisherSvc = new Publisher(this.org as Org);
    const assetId = this.flags.assetid as string;
    const publishers = ((await publisherSvc.list(assetId)) || []).map(publisher => ({
      id: publisher.id,
      assetid: publisher.assetId,
      publisheruser: publisher.publisherUser?.name,
      publisheruserid: publisher.publisherUser?.id
    }));
    if (publishers.length > 0) {
      this.ux.styledHeader(messages.getMessage('publishersFound', [publishers.length, assetId]));
    }
    return publishers;
  }
}
