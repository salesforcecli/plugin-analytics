/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/sf-plugins-core/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'recipe');

const recipeValues = [
  { id: '05vxx0000004C92AAE', name: 'myrecipe', namespace: 'testNS', label: 'my recipe', status: 'New' },
];

describe('analytics:recipe:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ recipes: recipeValues }))
    .stdout()
    .command(['analytics:recipe:list'])
    .it('runs analytics:recipe:list', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('recipesFound', [1]));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ recipes: [] }))
    .stdout()
    .command(['analytics:recipe:list'])
    .it('runs analytics:recipe:list', (ctx) => {
      expect(ctx.stdout).to.contain('No results found.');
    });
});
