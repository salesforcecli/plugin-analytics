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
import List from '../../../../src/commands/analytics/dashboard/history/list.js';
import {
  expectToHaveElementValue,
  getStdout,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'history');

const dashboardId = '0FKxx0000004CguGAE';
const dashboardHistories = [{ id: '0Rmxx0000004CdgCAE', dashboardId, name: 'testName', label: 'my history' }];

describe('analytics:dashboard:history:list', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --dashboardid ${dashboardId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ histories: dashboardHistories });

    await List.run(['--dashboardid', dashboardId]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(
      messages.getMessage('dashboardsHistoriesFound', [1])
    );
    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementValue(data, dashboardHistories[0].id, 'table');
    expectToHaveElementValue(data, dashboardHistories[0].label, 'table');
  });

  it(`runs: --dashboardid ${dashboardId} (no results)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ histories: [] });

    await List.run(['--dashboardid', dashboardId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('noResultsFound'));
    expect(getTableData(sfCommandStubs).data, 'table').to.be.undefined;
  });
});
