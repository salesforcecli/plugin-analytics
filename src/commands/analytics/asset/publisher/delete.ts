/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Publisher from '../../../../lib/analytics/publisher/publisher.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'asset');

export default class Delete extends SfCommand<void> {
  public static readonly summary = messages.getMessage('deleteCommandDescription');
  public static readonly description = messages.getMessage('deleteCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:asset:publisher:delete -a assetId -i assetPublisherId'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    id: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('assetPublisheridFlagDescription'),
      description: messages.getMessage('assetPublisheridFlagLongDescription'),
    }),
    assetid: Flags.salesforceId({
      char: 'a',
      required: true,
      summary: messages.getMessage('assetidFlagDescription'),
      description: messages.getMessage('assetidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Delete);
    const publisher = new Publisher(flags.targetOrg);
    await publisher.delete(flags.assetid, flags.id);
    this.log(messages.getMessage('deletePublisherSuccess', [flags.id]));
  }
}
