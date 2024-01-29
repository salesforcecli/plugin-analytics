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
import List from '../../../../src/commands/analytics/dataflow/history/list.js';
import {
  expectToHaveElementValue,
  getStdout,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'history');

const dataflowId = '02KEE00000BzNnl2AF';
const dataflowHistories = [
  { id: '0Rmxx0000004CdgCAE', dataflowid: '02KEE00000BzNnl2AF', name: 'testName', label: 'my history' },
];

describe('analytics:dataflow:history:list', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --dataflowid ${dataflowId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ histories: dataflowHistories });

    await List.run(['--dataflowid', dataflowId]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(
      messages.getMessage('dataflowsHistoriesFound', [1])
    );
    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementValue(data, dataflowHistories[0].id, 'table');
    expectToHaveElementValue(data, dataflowHistories[0].label, 'table');
  });

  it(`runs: --dataflowid ${dataflowId} (no results)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ histories: [] });

    await List.run(['--dataflowid', dataflowId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('noResultsFound'));
    expect(getTableData(sfCommandStubs).data, 'table').to.be.undefined;
  });
});
