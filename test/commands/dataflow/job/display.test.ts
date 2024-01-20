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
import Display from '../../../../src/commands/analytics/dataflow/job/display.js';
import { expectToHaveElementValue, getStyledHeaders, getTableData, stubDefaultOrg } from '../../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

const dataflowJob = {
  id: '03CEE00000CBRKX2A5',
  label: 'mydf',
  status: 'Queued',
  waitTime: 8,
  progress: 10,
  retryCount: 2,
  duration: 10,
  startDate: '2023-03-21T05:47:24.000Z',
};

describe('analytics:dataflow:job:display', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --dataflowjobid ${dataflowJob.id}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(dataflowJob);

    await Display.run(['--dataflowjobid', dataflowJob.id]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('displayDetailHeader'));
    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementValue(data, dataflowJob.id, 'table');
    expectToHaveElementValue(data, dataflowJob.label, 'table');
  });
});
