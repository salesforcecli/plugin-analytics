/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import Dataflow from '../../../../lib/analytics/dataflow/dataflow.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'history');

export default class Revert extends SfCommand<string | undefined> {
  public static readonly summary = messages.getMessage('revertCommandDescription');
  public static readonly description = messages.getMessage('revertCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:dataflow:history:revert -i <dataflowid> -y <historyid> -l <historyLabel> ',
  ];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    dataflowid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('dataflowidFlagDescription'),
      description: messages.getMessage('dataflowidFlagLongDescription'),
    }),
    historyid: Flags.salesforceId({
      char: 'y',
      required: true,
      summary: messages.getMessage('dataflowHistoryidFlagDescription'),
      description: messages.getMessage('dataflowHistoryidFlagLongDescription'),
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('revertLabelFlagDescription'),
      description: messages.getMessage('revertLabelFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Revert);
    const dataflowId = flags.dataflowid;
    const dataflowHistoryId = flags.historyid;
    const dataflowHistoryLabel = flags.label;
    const dataflow = new Dataflow(flags.targetOrg);

    const id = await dataflow.revertToHistory(dataflowId, dataflowHistoryId, dataflowHistoryLabel);
    const message = messages.getMessage('revertSuccess', [id, dataflowHistoryId]);
    this.log(message);
    return id;
  }
}
