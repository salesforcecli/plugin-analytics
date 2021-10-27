/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Dataflow from '../../../../lib/analytics/dataflow/dataflow';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'history');

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listDataflowHistoryCommandDescription');
  public static longDescription = messages.getMessage('listDataflowHistoryCommandLongDescription');

  public static examples = ['$ sfdx analytics:dataflow:history:list --dataflowid <dataflowid> '];

  protected static flagsConfig = {
    dataflowid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('dataflowidFlagDescription'),
      longDescription: messages.getMessage('dataflowidFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['historyid', 'dataflowid', 'name', 'label'];

  public async run() {
    const dataflow = new Dataflow(this.org as Org);
    const dataflowId = this.flags.dataflowid as string;
    const histories = ((await dataflow.getHistories(dataflowId)) || []).map(history => ({
      historyid: history.id,
      dataflowid: dataflowId,
      name: history.name,
      label: history.label
    }));
    if (histories.length) {
      this.ux.styledHeader(messages.getMessage('dataflowsHistoriesFound', [histories.length]));
    }
    return histories;
  }
}
