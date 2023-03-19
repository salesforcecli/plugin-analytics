/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'recipe');

const recipeId = '05vB0000000CetYIAS';
const dataflowJobId = '02KB0000000rqCoMAI';
const status = 'Queued';
describe('analytics:recipe:start', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ id: dataflowJobId, status }))
    .stdout()
    .command(['analytics:recipe:start', '--recipeid', recipeId])
    .it('runs analytics:recipe:start --recipeid 05vB0000000CetYIAS', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('recipeJobUpdate', [dataflowJobId, status]));
    });
});
