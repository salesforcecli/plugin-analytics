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

export default class Revert extends SfCommand<string | undefined> {
  public static readonly summary = messages.getMessage('revertCommandDescription');
  public static readonly description = messages.getMessage('revertCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:dashboard:history:revert -i <dashboardid> -y <historyid> -l <historyLabel> ',
  ];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    dashboardid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('dashboardidFlagDescription'),
      description: messages.getMessage('dashboardidFlagLongDescription'),
    }),
    historyid: Flags.salesforceId({
      char: 'y',
      required: true,
      summary: messages.getMessage('dashboardHistoryidFlagDescription'),
      description: messages.getMessage('dashboardHistoryidFlagLongDescription'),
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('revertLabelFlagDescription'),
      description: messages.getMessage('revertLabelFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Revert);
    const dashboardId = flags.dashboardid;
    const dashboardHistoryId = flags.historyid;
    const dashboardHistoryLabel = flags.label;
    const dashboard = new Dashboard(flags['target-org'].getConnection(flags['api-version']));

    const id = await dashboard.revertToHistory(dashboardId, dashboardHistoryId, dashboardHistoryLabel);
    const message = messages.getMessage('revertSuccess', [id, dashboardHistoryId]);
    this.log(message);
    return id;
  }
}
