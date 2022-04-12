/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'history');

const dashBoardHistoryValues = [
  { historyid: '0Rmxx0000004CdgCAE', dashboardid: '0FKxx0000004CguGAE', name: 'testName', label: 'my history' }
];

const dashboardId = '0FKxx0000004CguGAE';

describe('analytics:dashboard:history:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ histories: dashBoardHistoryValues }))
    .stdout()
    .command(['analytics:dashboard:history:list', '--dashboardid', dashboardId])
    .it('runs analytics:dashboard:history:list', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('dashboardsHistoriesFound', [1]));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ histories: [] }))
    .stdout()
    .command(['analytics:dashboard:history:list', '--dashboardid', dashboardId])
    .it('runs analytics:dashboard:history:list', ctx => {
      expect(ctx.stdout).to.contain('No results found.');
    });
});
