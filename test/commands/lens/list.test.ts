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
import List from '../../../src/commands/analytics/lens/list.js';
import { getStderr, getStdout, stubDefaultOrg } from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'lens');

const lensValues = [
  { id: '0FKxx0000004D3UGAU', name: 'mylens', label: 'my lens' },
  { id: '0FKxx0000004D3UGAY', name: 'mylenswithns', namespace: 'SomeNs', label: 'my lens with namespace' },
];

describe('analytics:lens:list', () => {
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
    $$.fakeConnectionRequest = () => Promise.resolve({ lenses: lensValues });

    await List.run([]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('lensesFound', [2]));
    expect(stdout, 'stdout').to.contain(lensValues[0].id);
    expect(stdout, 'stdout').to.contain(lensValues[0].label);
    expect(stdout, 'stdout').to.contain(lensValues[1].id);
    expect(stdout, 'stdout').to.contain(lensValues[1].label);
  });

  it('runs: --json', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ lenses: lensValues });

    await List.run(['--json']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    expect(JSON.parse(getStdout(sfCommandStubs)), 'stdout json').to.deep.equal({
      status: 0,
      result: [
        {
          lensid: lensValues[0].id,
          name: lensValues[0].name,
          label: lensValues[0].label,
        },
        {
          lensid: lensValues[1].id,
          name: lensValues[1].name,
          namespace: lensValues[1].namespace,
          label: lensValues[1].label,
        },
      ],
    });
  });

  it('runs (no results)', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ lenses: lensValues });

    await List.run([]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('noResultsFound'));
    expect(stdout, 'stdout').to.contain(lensValues[0].id);
    expect(stdout, 'stdout').to.contain(lensValues[0].label);
    expect(stdout, 'stdout').to.contain(lensValues[1].id);
    expect(stdout, 'stdout').to.contain(lensValues[1].label);
  });
});
