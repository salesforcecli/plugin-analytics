/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import List from '../../../src/commands/analytics/recipe/list.js';
import {
  expectToHaveElementValue,
  getStdout,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'recipe');

const recipeValues = [
  { id: '05vxx0000004C92AAE', name: 'myrecipe', namespace: 'testNS', label: 'my recipe', status: 'New' },
];

describe('analytics:recipe:list', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it('runs', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ recipes: recipeValues });

    await List.run([]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('recipesFound', [1]));
    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementValue(data, recipeValues[0].id, 'table');
    expectToHaveElementValue(data, recipeValues[0].name, 'table');
  });

  it('runs (no results)', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ recipes: [] });

    await List.run([]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('noResultsFound'));
    expect(stdout, 'stdout').to.not.contain(recipeValues[0].id);
    expect(stdout, 'stdout').to.not.contain(recipeValues[0].name);
  });
});
