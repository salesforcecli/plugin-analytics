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

const dashBoardValues = [
  {
    id: '0FKxx0000004CSPGA2',
    name: 'mydash',
    namespace: 'testNS',
    label: 'my dashboard',
    folder: { id: '0llxx000000000zCAA', name: 'my app' },
  },
];

describe('analytics:dashboard:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ dashboards: dashBoardValues }))
    .stdout()
    .command(['analytics:dashboard:list'])
    .it('runs analytics:dashboard:list', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('dashboardsFound', [1]));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ dashboards: [] }))
    .stdout()
    .command(['analytics:dashboard:list'])
    .it('runs analytics:dashboard:list', (ctx) => {
      expect(ctx.stdout).to.contain('No results found.');
    });
});
