/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Dashboard from '../../../../lib/analytics/dashboard/dashboard';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'history');

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listDashboardHistoryCommandDescription');
  public static longDescription = messages.getMessage('listDashboardHistoryCommandLongDescription');

  public static examples = ['$ sfdx analytics:dashboard:history:list --dashboardid <dashboardid>'];

  protected static flagsConfig = {
    dashboardid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('dashboardidFlagDescription'),
      longDescription: messages.getMessage('dashboardidFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['historyid', 'dashboardid', 'name', 'label', 'isCurrent'];

  public async run() {
    const dashboard = new Dashboard(this.org as Org);
    const dashboardId = this.flags.dashboardid as string;
    const histories = ((await dashboard.getHistories(dashboardId)) || []).map(history => ({
      historyid: history.id,
      dashboardid: dashboardId,
      name: history.name,
      label: history.label,
      isCurrent: history.isCurrent ? '*' : ''
    }));
    if (histories.length) {
      this.ux.styledHeader(messages.getMessage('dashboardsHistoriesFound', [histories.length]));
    }
    return histories;
  }
}
