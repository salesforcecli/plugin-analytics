/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/sf-plugins-core/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'asset');
const developerId = '0Rmxx0000004IJICA2';

describe('analytics:asset:publisher:create', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ id: developerId }))
    .stdout()
    .command(['analytics:asset:publisher:create', '--assetid', '0Rmxx0000004IJICA2'])
    .it('runs analytics:asset:publisher:create  --assetid 0Rmxx0000004IJICA2', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('createSuccess', [developerId]));
    });
});
