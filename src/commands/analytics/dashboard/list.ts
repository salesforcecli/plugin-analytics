/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Dashboard from '../../../lib/analytics/dashboard/dashboard';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dashboard');

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listCommandDescription');
  public static longDescription = messages.getMessage('listCommandLongDescription');

  public static examples = ['$ sfdx analytics:dashboard:list'];

  protected static flagsConfig = {};

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = [
    'dashboardid',
    'name',
    'namespace',
    'label',
    'folderid',
    'foldername',
    'currentHistoryId'
  ];

  public async run() {
    const dashboardSvc = new Dashboard(this.org as Org);
    const dashboards = ((await dashboardSvc.list()) || []).map(dashboard => ({
      dashboardid: dashboard.id,
      name: dashboard.name,
      namespace: dashboard.namespace,
      label: dashboard.label,
      folderid: dashboard.folder?.id,
      foldername: dashboard.folder?.name,
      currentHistoryId: dashboard.currentHistoryId
    }));
    if (dashboards.length) {
      this.ux.styledHeader(messages.getMessage('dashboardsFound', [dashboards.length]));
    }
    return dashboards;
  }
}
