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
const dataflowName = 'dataflow';
const dataflowStr = JSON.stringify({ extract: { action: 'edgemart' } });

describe('analytics:dataflow:upload', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ dataflowId, name: dataflowName }))
    .stdout()
    .command(['analytics:dataflow:upload', '--dataflowid', dataflowId, '--dataflowstr', dataflowStr])
    .it('runs analytics:dataflow:upload --dataflowid 0FK9A0000008SDWWA2 --dataflowstr ' + dataflowStr, ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('uploadDataflowUpdate', [dataflowName, dataflowId]));
    });
});
