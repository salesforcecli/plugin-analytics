/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { core } from '@salesforce/command';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'dataflow');

const dataflowValues = [
  { id: '02Kxx0000004DghEAE', name: 'mydf', namespace: 'testNS', label: 'my mydf', type: 'dataflow' }
];

describe('analytics:dataflow:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ dataflows: dataflowValues }))
    .stdout()
    .command(['analytics:dataflow:list'])
    .it('runs analytics:dataflow:list', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('dataflowsFound', [1]));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ dataflows: [] }))
    .stdout()
    .command(['analytics:dataflow:list'])
    .it('runs analytics:dataflow:list', ctx => {
      expect(ctx.stdout).to.contain('No results found.');
    });
});
