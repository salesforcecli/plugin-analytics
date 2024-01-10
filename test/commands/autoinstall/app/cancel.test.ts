/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/sf-plugins-core/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'autoinstall');
const autoinstallId = '0llxx000000000zCAA';

describe('analytics:autoinstall:app:cancel', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({}))
    .stdout()
    .command(['analytics:autoinstall:app:cancel', '-i', autoinstallId])
    .it('runs analytics:autoinstall:app:cancel -i', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('appAutoInstallCancelRequestSuccess', [autoinstallId]));
    });
});
