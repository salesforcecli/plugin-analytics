/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import List from '../../../../src/commands/analytics/dataflow/job/list.js';
import {
  expectToHaveElementValue,
  getStdout,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

const dataflowId = '02KEE00000BzNnl2AF';
const dataflowJobs = [
  {
    id: '03CEE00000CBRKX2A5',
    label: 'mydf',
    status: 'Queued',
    waitTime: 8,
    progress: 10,
    retryCount: 2,
    startDate: '2023-03-21T05:47:24.000Z',
  },
];

describe('analytics:dataflow:job:list', () => {
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
    $$.fakeConnectionRequest = () => Promise.resolve({ dataflowJobs });

    await List.run(['--dataflowid', dataflowId]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('dataflowsFound', [1]));
    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementValue(data, dataflowJobs[0].id, 'table');
    expectToHaveElementValue(data, dataflowJobs[0].label, 'table');
  });

  it(`runs: --dataflowid ${dataflowId} (no results)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ dataflowJobs: [] });

    await List.run(['--dataflowid', dataflowId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('noResultsFound'));
  });
});
