/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'dataflow');

const dataflowId = '0FK9A0000008SDWWA2';
const dataflowJobId = '030EE00000Cfj3uYAB';
const status = 'Queued';
describe('analytics:dataflow:start', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ id: dataflowJobId, status: 'Queued' }))
    .stdout()
    .command(['analytics:dataflow:start', '--dataflowid', dataflowId])
    .it('runs analytics:dataflow:start --dataflowid 0FK9A0000008SDWWA2', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('dataflowsJobUpdate', [dataflowJobId, status]));
    });
});
