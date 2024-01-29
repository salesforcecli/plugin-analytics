/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import List from '../../../src/commands/analytics/dashboard/list.js';
import {
  expectToHaveElementValue,
  getStdout,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dashboard');

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
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it('runs', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ dashboards: dashBoardValues });

    await List.run([]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('dashboardsFound', [1]));
    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementValue(data, dashBoardValues[0].id, 'table');
    expectToHaveElementValue(data, dashBoardValues[0].label, 'table');
  });

  it('runs (no results)', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ dashboards: [] });

    await List.run([]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('noResultsFound'));
    expect(getTableData(sfCommandStubs).data, 'table').to.be.undefined;
  });
});
