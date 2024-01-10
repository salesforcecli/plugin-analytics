/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Publisher from '../../../../lib/analytics/publisher/publisher.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'asset');

export default class Create extends SfCommand<string | undefined> {
  public static readonly summary = messages.getMessage('publisherCreateCommandDescription');
  public static readonly description = messages.getMessage('publisherCreateCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:asset:publisher:create -i assetId'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    assetid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('assetidFlagDescription'),
      description: messages.getMessage('assetidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Create);
    const publisher = new Publisher(flags.targetOrg);
    const assetId = flags.assetid;
    const developerId = await publisher.create(assetId);
    this.log(messages.getMessage('createSuccess', [developerId]));
    return developerId;
  }
}
