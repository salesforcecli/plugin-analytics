/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';

const messages = core.Messages.loadMessages('@salesforce/analytics', 'app');
const appId = '0llxx000000000zCAA';
const templateId = '0llxx000000000zCAA';

describe('analytics:app:update', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ id: appId }))
    .stdout()
    .command(['analytics:app:update', '--folderid', appId, '--templateid', templateId])
    .it('runs analytics:app:update  --folderid 0llxx000000000zCAA --templateid 0llxx000000000zCAA', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('updateSuccess', [appId]));
    });
});
