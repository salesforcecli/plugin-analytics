/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/sf-plugins-core/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'history');

const dataflowId = '0FK9A0000008SDWWA2';
const dataflowHistoryId = '0Rm9A00000006yeSAA';

describe('analytics:dataflow:history:revert', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ id: dataflowId }))
    .stdout()
    .command(['analytics:dataflow:history:revert', '--dataflowid', dataflowId, '--historyid', dataflowHistoryId])
    .it(
      'runs analytics:dataflow:history:revert --dataflowid 0FK9A0000008SDWWA2 --historyid 0Rm9A00000006yeSAA',
      (ctx) => {
        expect(ctx.stdout).to.contain(messages.getMessage('revertSuccess', [dataflowId, dataflowHistoryId]));
      }
    );
});
