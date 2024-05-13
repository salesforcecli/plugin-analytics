/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  SfCommand,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Publisher from '../../../../lib/analytics/publisher/publisher.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'asset');

export default class Deleteall extends SfCommand<string> {
  public static readonly summary = messages.getMessage('deleteallCommandDescription');
  public static readonly description = messages.getMessage('deleteallCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:asset:publisher:deleteall -i assetId'];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    assetid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('assetidFlagDescription'),
      description: messages.getMessage('assetidFlagLongDescription'),
    }),
    noprompt: Flags.boolean({
      char: 'p',
      summary: messages.getMessage('nopromptFlagDescription'),
      description: messages.getMessage('nopromptFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Deleteall);
    if (flags.noprompt || (await this.confirm({ message: messages.getMessage('confirmDeleteYesNo') }))) {
      const publisher = new Publisher(flags['target-org'].getConnection(flags['api-version']));
      await publisher.deleteAll(flags.assetid);
      this.log(messages.getMessage('deletePublishersSuccess', [flags.assetid]));
    }
    return flags.assetid;
  }
}
