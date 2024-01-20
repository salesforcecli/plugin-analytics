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

import Lens from '../../../../lib/analytics/lens/lens.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'history');

export default class List extends SfCommand<
  Array<{ historyid?: string; lensid?: string; name?: string; label?: string }>
> {
  public static readonly summary = messages.getMessage('listLensHistoryCommandDescription');
  public static readonly description = messages.getMessage('listLensHistoryCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:lens:history:list --lensid <lensid> '];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    lensid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('lensidFlagDescription'),
      description: messages.getMessage('lensidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(List);
    const lens = new Lens(flags['target-org'].getConnection(flags['api-version']));
    const lensId = flags.lensid;
    const histories = ((await lens.getHistories(lensId)) || []).map((history) => ({
      historyid: history.id,
      lensid: lensId,
      name: history.name,
      label: history.label,
    }));
    if (histories.length > 0) {
      this.styledHeader(messages.getMessage('lensHistoriesFound', [histories.length]));
      this.table(histories, {
        historyid: { header: 'historyid' },
        lensid: { header: 'lensid' },
        name: { header: 'name' },
        label: { header: 'label' },
      });
    } else {
      this.log(messages.getMessage('noResultsFound'));
    }
    return histories;
  }
}
