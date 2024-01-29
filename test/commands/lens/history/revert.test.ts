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
import { ensureJsonMap } from '@salesforce/ts-types';
import Revert from '../../../../src/commands/analytics/lens/history/revert.js';
import { getStdout, stubDefaultOrg } from '../../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'history');

const lensId = '0FK9A0000008SDWWA2';
const lensHistoryId = '0Rm9A00000006yeSAA';

describe('analytics:lens:history:revert', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --lensid ${lensId} --historyid ${lensHistoryId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      if (ensureJsonMap(request).method === 'PUT') {
        return Promise.resolve({ asset: { id: lensId } });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Revert.run(['--lensid', lensId, '--historyid', lensHistoryId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('revertSuccess', [lensId, lensHistoryId]));
  });
});
