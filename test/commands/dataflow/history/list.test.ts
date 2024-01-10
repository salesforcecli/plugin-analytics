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

const dataflowHistoryValues = [
  { historyid: '0Rmxx0000004CdgCAE', dataflowid: '02Kxx0000004DghEAE', name: 'testName', label: 'my history' },
];

const dataflowId = '02Kxx0000004DghEAE';

describe('analytics:dataflow:history:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ histories: dataflowHistoryValues }))
    .stdout()
    .command(['analytics:dataflow:history:list', '--dataflowid', dataflowId])
    .it('runs analytics:dataflow:history:list', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('dataflowsHistoriesFound', [1]));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ histories: [] }))
    .stdout()
    .command(['analytics:dataflow:history:list', '--dataflowid', dataflowId])
    .it('runs analytics:dataflow:history:list', (ctx) => {
      expect(ctx.stdout).to.contain('No results found.');
    });
});
