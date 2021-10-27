/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Lens from '../../../../lib/analytics/lens/lens';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'history');

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listLensHistoryCommandDescription');
  public static longDescription = messages.getMessage('listLensHistoryCommandLongDescription');

  public static examples = ['$ sfdx analytics:lens:history:list --lensid <lensid> '];

  protected static flagsConfig = {
    lensid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('lensidFlagDescription'),
      longDescription: messages.getMessage('lensidFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['historyid', 'lensid', 'name', 'label'];

  public async run() {
    const lens = new Lens(this.org as Org);
    const lensId = this.flags.lensid as string;
    const histories = ((await lens.getHistories(lensId)) || []).map(history => ({
      historyid: history.id,
      lensid: lensId,
      name: history.name,
      label: history.label
    }));
    if (histories.length) {
      this.ux.styledHeader(messages.getMessage('lensHistoriesFound', [histories.length]));
    }
    return histories;
  }
}
