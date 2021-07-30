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

export default class Revert extends SfdxCommand {
  public static description = messages.getMessage('revertCommandDescription');
  public static longDescription = messages.getMessage('revertCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:dashboard:history:revert -i <dashboardid> -y <historyid> -l <historyLabel> '
  ];

  protected static flagsConfig = {
    dashboardid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('dashboardidFlagDescription'),
      longDescription: messages.getMessage('dashboardidFlagLongDescription')
    }),
    historyid: flags.id({
      char: 'y',
      required: true,
      description: messages.getMessage('dashboardHistoryidFlagDescription'),
      longDescription: messages.getMessage('dashboardHistoryidFlagLongDescription')
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
    const dashboardId = this.flags.dashboardid as string;
    const dashboardHistoryId = this.flags.historyid as string;
    const dashboardHistoryLabel = this.flags.label as string | undefined;
    const dashboard = new Dashboard(this.org as Org);

    const id = await dashboard.revertToHistory(dashboardId, dashboardHistoryId, dashboardHistoryLabel);
    const message = messages.getMessage('revertSuccess', [id, dashboardHistoryId]);
    this.ux.log(message);
    return id;
  }
}
