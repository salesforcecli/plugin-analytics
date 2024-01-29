/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import { AnyJson, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import Stop from '../../../../src/commands/analytics/dataflow/job/stop.js';
import { getStdout, stubDefaultOrg } from '../../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

const dataflowjobId = '0FK9A0000008SDWWA2';
const status = 'Failure';

describe('analytics:dataflow:job:stop', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --dataflowjobid ${dataflowjobId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (
        ensureString(request.method) === 'PATCH' &&
        ensureString(request.url).endsWith(`/wave/dataflowjobs/${dataflowjobId}`)
      ) {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ dataflowjobId, status: 'Failure' });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Stop.run(['--dataflowjobid', dataflowjobId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('dataflowJobUpdate', [dataflowjobId, status]));
    expect(requestBody, 'request body').to.deep.equal({ command: 'stop' });
  });
});
