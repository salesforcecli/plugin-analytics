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
import List from '../../../src/commands/analytics/dataflow/list.js';
import {
  expectToHaveElementValue,
  getStdout,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

const dataflowValues = [
  { id: '02Kxx0000004DghEAE', name: 'mydf', namespace: 'testNS', label: 'my mydf', type: 'dataflow' },
];

describe('analytics:dataflow:list', () => {
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
    $$.fakeConnectionRequest = () => Promise.resolve({ dataflows: dataflowValues });

    await List.run([]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('dataflowsFound', [1]));
    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementValue(data, dataflowValues[0].id, 'table');
    expectToHaveElementValue(data, dataflowValues[0].label, 'table');
  });

  it('runs (no results)', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ dataflows: [] });

    await List.run([]);
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('noResultsFound'));
    expect(getTableData(sfCommandStubs).data, 'table').to.be.undefined;
  });
});
