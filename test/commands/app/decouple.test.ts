/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/sf-plugins-core/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'app');
const folderId = '0llxx000000000zCAA';
const templateId = '0Nkxx000000000zCAA';

describe('analytics:app:decouple', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => {
      return Promise.resolve({ id: folderId });
    })
    .stdout()
    .command(['analytics:app:decouple', '--folderid', folderId, '--templateid', templateId])
    .it('runs analytics:app:decouple  --folderid 0llxx000000000zCAA --templateid 0Nkxx000000000zCAA', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('decoupleSuccess', [folderId, templateId]));
    });
});
