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
import { ensureJsonMap, ensureString } from '@salesforce/ts-types';
import Delete from '../../../src/commands/analytics/app/delete.js';
import { getStdout, stubDefaultOrg } from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

const appId = '0llxx000000000zCAA';

describe('analytics:app:delete', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --noprompt --folderid ${appId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'DELETE') {
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Delete.run(['--noprompt', '--folderid', appId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('deleteAppSuccess', [appId]));
  });
});
