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

const lensId = '0FK9A0000008SDWWA2';
const lensHistoryId = '0Rm9A00000006yeSAA';

describe('analytics:lens:history:revert', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ asset: { id: lensId } }))
    .stdout()
    .command(['analytics:lens:history:revert', '--lensid', lensId, '--historyid', lensHistoryId])
    .it('runs analytics:lens:history:revert --lensid 0FK9A0000008SDWWA2 --historyid 0Rm9A00000006yeSAA', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('revertSuccess', [lensId, lensHistoryId]));
    });
});
