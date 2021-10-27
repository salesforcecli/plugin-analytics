/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Dashboard from '../../../lib/analytics/dashboard/dashboard';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dashboard');

export default class Update extends SfdxCommand {
  public static description = messages.getMessage('updateCommandDescription');
  public static longDescription = messages.getMessage('updateCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:dashboard:update -i dashboardId -y currentHistoryId',
    '$ sfdx analytics:dashboard:update -i dashboardId -r'
  ];

  protected static flagsConfig = {
    dashboardid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('dashboardIdFlagDescription'),
      longDescription: messages.getMessage('dahsboardIdFlagLongDescription')
    }),
    currenthistoryid: flags.id({
      char: 'y',
      description: messages.getMessage('currentHistoryIdFlagDescription'),
      longDescription: messages.getMessage('currentHistoryIdLongDescription')
    }),
    removecurrenthistory: flags.boolean({
      char: 'r',
      description: messages.getMessage('removeCurrentHistoryFlagDescription'),
      longDescription: messages.getMessage('removeCurrentHistoryLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const dashboard = new Dashboard(this.org as Org);
    // -h and -r are kind of exclusive, and, in the oclif flags, you can pass in neither,
    // in which case we should should consider a missing or no -h to be the same as -r
    const historyId = (!this.flags.removecurrenthistory && (this.flags.currenthistoryid as string)) || '';
    const id = await dashboard.updateCurrentHistoryId(this.flags.dashboardid, historyId);
    // If error occurs here fails out in the update call and reports back, otherwise success

    // if we sent up an empty historyId, that's the same as -r
    if (!historyId) {
      this.ux.log(messages.getMessage('updateRemoveSuccess', []));
    } else {
      this.ux.log(messages.getMessage('updateSuccess', [historyId]));
    }
    return id;
  }
}
