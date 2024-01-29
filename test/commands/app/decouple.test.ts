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
import { AnyJson, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import Decouple from '../../../src/commands/analytics/app/decouple.js';
import { getStdout, stubDefaultOrg } from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

const folderId = '0llxx000000000zCAA';
const templateId = '0Nkxx000000000zCAA';

describe('analytics:app:decouple', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --folderid ${folderId} --templateid ${templateId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'PUT') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: folderId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Decouple.run(['--folderid', folderId, '--templateid', templateId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('decoupleSuccess', [folderId, templateId]));
    expect(requestBody, 'requesty body').to.deep.equal({
      templateSourceId: templateId,
      templateOptions: { appAction: 'DecoupleApp' },
    });
  });
});
