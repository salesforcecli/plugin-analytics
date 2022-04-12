/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'history');

const lensHistoryValues = [
  { historyid: '0Rmxx0000004CdgCAE', lensid: '0FKxx0000004D3UGAU', name: 'testName', label: 'my history' }
];

const lensId = '0FKxx0000004D3UGAU';

describe('analytics:lens:history:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ histories: lensHistoryValues }))
    .stdout()
    .command(['analytics:lens:history:list', '--lensid', lensId])
    .it('runs analytics:lens:history:list', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('lensHistoriesFound', [1]));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ histories: [] }))
    .stdout()
    .command(['analytics:lens:history:list', '--lensid', lensId])
    .it('runs analytics:lens:history:list', ctx => {
      expect(ctx.stdout).to.contain('No results found.');
    });
});
