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

import Dashboard from '../../../../lib/analytics/dashboard/dashboard.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
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
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    dashboardid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('dashboardidFlagDescription'),
      description: messages.getMessage('dashboardidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(List);
    const dashboard = new Dashboard(flags['target-org'].getConnection(flags['api-version']));
    const dashboardId = flags.dashboardid;
    const histories = ((await dashboard.getHistories(dashboardId)) || []).map((history) => ({
      historyid: history.id,
      dashboardid: dashboardId,
      name: history.name,
      label: history.label,
      isCurrent: history.isCurrent ? '*' : '',
    }));
    if (histories.length > 0) {
      this.styledHeader(messages.getMessage('dashboardsHistoriesFound', [histories.length]));
      this.table(histories, {
        historyid: { header: 'historyid' },
        dashboardid: { header: 'dashboardid' },
        name: { header: 'name' },
        label: { header: 'label' },
        isCurrent: { header: 'isCurrent' },
      });
    } else {
      this.log(messages.getMessage('noResultsFound'));
    }
    return histories;
  }
}
