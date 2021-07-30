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

export default class Revert extends SfdxCommand {
  public static description = messages.getMessage('revertCommandDescription');
  public static longDescription = messages.getMessage('revertCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:dataflow:history:revert -i <dataflowid> -y <historyid> -l <historyLabel> '
  ];

  protected static flagsConfig = {
    dataflowid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('dataflowidFlagDescription'),
      longDescription: messages.getMessage('dataflowidFlagLongDescription')
    }),
    historyid: flags.id({
      char: 'y',
      required: true,
      description: messages.getMessage('dataflowHistoryidFlagDescription'),
      longDescription: messages.getMessage('dataflowHistoryidFlagLongDescription')
    }),
    label: flags.string({
      char: 'l',
      description: messages.getMessage('revertLabelFlagDescription'),
      longDescription: messages.getMessage('revertLabelFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const dataflowId = this.flags.dataflowid as string;
    const dataflowHistoryId = this.flags.historyid as string;
    const dataflowHistoryLabel = this.flags.label as string | undefined;
    const dataflow = new Dataflow(this.org as Org);

    const id = await dataflow.revertToHistory(dataflowId, dataflowHistoryId, dataflowHistoryLabel);
    const message = messages.getMessage('revertSuccess', [id, dataflowHistoryId]);
    this.ux.log(message);
    return id;
  }
}
