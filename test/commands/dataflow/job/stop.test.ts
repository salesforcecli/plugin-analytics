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

const dataflowjobId = '0FK9A0000008SDWWA2';
const status = 'Failure';
describe('analytics:dataflow:job:stop', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ dataflowjobId, status: 'Failure' }))
    .stdout()
    .command(['analytics:dataflow:job:stop', '--dataflowjobid', dataflowjobId])
    .it('runs analytics:dataflow:job:stop --dataflowjobid 0FK9A0000008SDWWA2', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('dataflowJobUpdate', [dataflowjobId, status]));
    });
});
