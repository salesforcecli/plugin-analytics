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

import Dashboard from '../../../lib/analytics/dashboard/dashboard.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dashboard');

export default class Update extends SfCommand<string | undefined> {
  public static readonly summary = messages.getMessage('updateCommandDescription');
  public static readonly description = messages.getMessage('updateCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:dashboard:update -i dashboardId -y currentHistoryId',
    '$ sfdx analytics:dashboard:update -i dashboardId -r',
  ];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    dashboardid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('dashboardIdFlagDescription'),
      description: messages.getMessage('dahsboardIdFlagLongDescription'),
    }),
    currenthistoryid: Flags.salesforceId({
      char: 'y',
      summary: messages.getMessage('currentHistoryIdFlagDescription'),
      description: messages.getMessage('currentHistoryIdLongDescription'),
    }),
    removecurrenthistory: Flags.boolean({
      char: 'r',
      summary: messages.getMessage('removeCurrentHistoryFlagDescription'),
      description: messages.getMessage('removeCurrentHistoryLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Update);
    const dashboard = new Dashboard(flags['target-org'].getConnection(flags['api-version']));
    // -h and -r are kind of exclusive, and, in the oclif flags, you can pass in neither,
    // in which case we should should consider a missing or no -h to be the same as -r
    const historyId = (!flags.removecurrenthistory ? flags.currenthistoryid : undefined) ?? '';
    const id = await dashboard.updateCurrentHistoryId(flags.dashboardid, historyId);
    // If error occurs here fails out in the update call and reports back, otherwise success

    // if we sent up an empty historyId, that's the same as -r
    if (!historyId) {
      this.log(messages.getMessage('updateRemoveSuccess', []));
    } else {
      this.log(messages.getMessage('updateSuccess', [historyId]));
    }
    return id;
  }
}
