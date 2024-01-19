/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  SfCommand,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Publisher from '../../../../lib/analytics/publisher/publisher.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'asset');

export default class List extends SfCommand<
  Array<{
    id?: string;
    assetId?: string;
    publishuser?: string;
    publishuserid?: string;
  }>
> {
  public static readonly summary = messages.getMessage('publisherListCommandDescription');
  public static readonly description = messages.getMessage('publisherListCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:asset:publisher:list -i assetId'];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    assetid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('assetidFlagDescription'),
      description: messages.getMessage('assetidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(List);
    const publisherSvc = new Publisher(flags['target-org'].getConnection(flags['api-version']));
    const assetId = flags.assetid;
    const publishers = ((await publisherSvc.list(assetId)) ?? []).map((publisher) => ({
      id: publisher.id,
      assetid: publisher.assetId,
      publisheruser: publisher.publisherUser?.name,
      publisheruserid: publisher.publisherUser?.id,
    }));
    this.styledHeader(messages.getMessage('publishersFound', [publishers.length, assetId]));
    this.table(publishers, {
      id: { header: 'id' },
      assetid: { header: 'assetid' },
      publisheruser: { header: 'publisheruser' },
      publisheruserid: { header: 'publisheruserid' },
    });
    return publishers;
  }
}
