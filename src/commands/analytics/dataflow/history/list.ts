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

export default class List extends SfCommand<
  Array<{ historyid?: string; dataflowid: string; name?: string; label?: string }>
> {
  public static readonly summary = messages.getMessage('listDataflowHistoryCommandDescription');
  public static readonly description = messages.getMessage('listDataflowHistoryCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:dataflow:history:list --dataflowid <dataflowid> '];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    dataflowid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('dataflowidFlagDescription'),
      description: messages.getMessage('dataflowidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(List);
    const dataflow = new Dataflow(flags.targetOrg);
    const dataflowId = flags.dataflowid;
    const histories = ((await dataflow.getHistories(dataflowId)) || []).map((history) => ({
      historyid: history.id,
      dataflowid: dataflowId,
      name: history.name,
      label: history.label,
    }));
    this.styledHeader(messages.getMessage('dataflowsHistoriesFound', [histories.length]));
    this.table(histories, {
      historyid: { header: 'historyid' },
      dataflowid: { header: 'dataflowid' },
      name: { header: 'name' },
      label: { header: 'label' },
    });
    return histories;
  }
}
