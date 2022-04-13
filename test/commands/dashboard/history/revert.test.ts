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

const dashboardId = '0FKxx0000004CguGAE';
const dashboardHistoryId = '0Rm9A0000008PtsSAE';

describe('analytics:dashboard:history:revert', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ asset: { id: dashboardId } }))
    .stdout()
    .command(['analytics:dashboard:history:revert', '--dashboardid', dashboardId, '--historyid', dashboardHistoryId])
    .it(
      'runs analytics:dashboard:history:revert --dashboardid 0FKxx0000004CguGAE --historyid 0Rm9A0000008PtsSAE',
      ctx => {
        expect(ctx.stdout).to.contain(messages.getMessage('revertSuccess', [dashboardId, dashboardHistoryId]));
      }
    );
});
