/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/sf-plugins-core/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'dashboard');
const dashboardId = '0FKxx0000004GNwGAM';
const currentHistoryId = '0Rmxx0000004IPkCAM';

describe('analytics:dashboard:update', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ id: dashboardId }))
    .stdout()
    .command(['analytics:dashboard:update', '--dashboardid', dashboardId, '--currenthistoryid', currentHistoryId])
    .it(
      'runs analytics:dashboard:update  --dashboardid 0FKxx0000004GNwGAM --currenthistoryid 0Rmxx0000004IPkCAM',
      (ctx) => {
        expect(ctx.stdout).to.contain(messages.getMessage('updateSuccess', [currentHistoryId]));
      }
    );

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ id: dashboardId }))
    .stdout()
    .command(['analytics:dashboard:update', '--dashboardid', dashboardId, '--removecurrenthistory'])
    .it('runs analytics:dashboard:update  --dashboardid 0FKxx0000004GNwGAM --removecurrenthistory', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('updateRemoveSuccess', []));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ id: dashboardId }))
    .stdout()
    .command(['analytics:dashboard:update', '--dashboardid', dashboardId])
    .it('runs analytics:dashboard:update  --dashboardid 0FKxx0000004GNwGAM', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('updateRemoveSuccess', []));
    });
});
