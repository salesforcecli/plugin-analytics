/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages, SfError } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import { AnyJson, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import Create from '../../../../src/commands/analytics/asset/publisher/create.js';
import { getStdout, stubDefaultOrg } from '../../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'asset');

const developerId = '0Rmxx0000004IJICA2';

describe('analytics:asset:publisher:create', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it('runs: --assetid 0Rmxx0000004IJICA2', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: developerId });
      }
      return Promise.reject(new SfError('Invalid request: ' + JSON.stringify(request)));
    };

    await Create.run(['--assetid', '0Rmxx0000004IJICA2']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('createSuccess', [developerId]));
    expect(requestBody, 'request body').to.deep.equal({});
  });
});
