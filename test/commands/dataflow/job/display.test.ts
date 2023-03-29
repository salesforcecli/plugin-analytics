/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'dataflow');

const dataflowJobId = '030EE00000Cfj3uYAB';
const dataflowJob = {
  id: '03CEE00000CBRKX2A5',
  label: 'mydf',
  status: 'Queued',
  waitTime: 8,
  progress: 10,
  retryCount: 2,
  duration: 10,
  startDate: '2023-03-21T05:47:24.000Z'
};

describe('analytics:dataflow:job:display', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(dataflowJob))
    .stdout()
    .command(['analytics:dataflow:job:display', '--dataflowjobid', dataflowJobId])
    .it('runs analytics:dataflow:job:display --dataflowjobid ' + dataflowJobId, ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('displayDetailHeader'));
    });
});
