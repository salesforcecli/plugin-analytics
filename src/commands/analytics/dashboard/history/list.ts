/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Dashboard from '../../../../lib/analytics/dashboard/dashboard.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'history');

export default class List extends SfCommand<
  Array<{
    historyid?: string;
    dashboardid: string;
    name?: string;
    label?: string;
    isCurrent: string;
  }>
> {
  public static readonly summary = messages.getMessage('listDashboardHistoryCommandDescription');
  public static readonly description = messages.getMessage('listDashboardHistoryCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:dashboard:history:list --dashboardid <dashboardid>'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    dashboardid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('dashboardidFlagDescription'),
      description: messages.getMessage('dashboardidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(List);
    const dashboard = new Dashboard(flags.targetOrg);
    const dashboardId = flags.dashboardid;
    const histories = ((await dashboard.getHistories(dashboardId)) || []).map((history) => ({
      historyid: history.id,
      dashboardid: dashboardId,
      name: history.name,
      label: history.label,
      isCurrent: history.isCurrent ? '*' : '',
    }));
    this.styledHeader(messages.getMessage('dashboardsHistoriesFound', [histories.length]));
    this.table(histories, {
      historyid: { header: 'historyid' },
      dashboardid: { header: 'dashboardid' },
      name: { header: 'name' },
      label: { header: 'label' },
      isCurrent: { header: 'isCurrent' },
    });
    return histories;
  }
}
