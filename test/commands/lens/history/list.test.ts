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
import List from '../../../../src/commands/analytics/lens/history/list.js';
import { getStdout, stubDefaultOrg } from '../../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'history');

const lensHistoryValues = [
  { historyid: '0Rmxx0000004CdgCAE', lensid: '0FKxx0000004D3UGAU', name: 'testName', label: 'my history' },
];

const lensId = '0FKxx0000004D3UGAU';

describe('analytics:lens:history:list', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --lensid ${lensId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ histories: lensHistoryValues });

    await List.run(['--lensid', lensId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('lensHistoriesFound', [1]));
    expect(stdout, 'stdout').to.contain(lensHistoryValues[0].historyid);
    expect(stdout, 'stdout').to.contain(lensHistoryValues[0].label);
  });

  it(`runs: --lensid ${lensId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ histories: [] });

    await List.run(['--lensid', lensId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('noResultsFound'));
    expect(stdout, 'stdout').to.not.contain(lensHistoryValues[0].historyid);
    expect(stdout, 'stdout').to.not.contain(lensHistoryValues[0].label);
  });
});
