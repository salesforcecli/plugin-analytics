/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
  SfCommand,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Dashboard from '../../../lib/analytics/dashboard/dashboard.js';
import { generateTableColumns } from '../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dashboard');

export default class List extends SfCommand<
  Array<{
    dashboardid?: string;
    name?: string;
    namespace?: string;
    label?: string;
    folderid?: string;
    foldername?: string;
    currentHistoryId?: string;
  }>
> {
  public static readonly summary = messages.getMessage('listCommandDescription');
  public static readonly description = messages.getMessage('listCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:dashboard:list'];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
  };

  public async run() {
    const { flags } = await this.parse(List);
    const dashboardSvc = new Dashboard(flags['target-org'].getConnection(flags['api-version']));
    const dashboards = ((await dashboardSvc.list()) || []).map((dashboard) => ({
      dashboardid: dashboard.id,
      name: dashboard.name,
      namespace: dashboard.namespace,
      label: dashboard.label,
      folderid: dashboard.folder?.id,
      foldername: dashboard.folder?.name,
      currentHistoryId: dashboard.currentHistoryId,
    }));
    if (dashboards.length > 0) {
      this.styledHeader(messages.getMessage('dashboardsFound', [dashboards.length]));
      this.table(
        dashboards,
        generateTableColumns([
          'dashboardid',
          'name',
          'namespace',
          'label',
          'folderid',
          'foldername',
          'currentHistoryId',
        ])
      );
    } else {
      this.log(messages.getMessage('noResultsFound'));
    }
    return dashboards;
  }
}
