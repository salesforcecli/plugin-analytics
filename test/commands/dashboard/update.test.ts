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
import Update from '../../../src/commands/analytics/dashboard/update.js';
import { getStdout, stubDefaultOrg } from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dashboard');
const dashboardId = '0FKxx0000004GNwGAM';
const currentHistoryId = '0Rmxx0000004IPkCAM';

describe('analytics:dashboard:update', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --dashboardid ${dashboardId} --currenthistoryid ${currentHistoryId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'PATCH') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: dashboardId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Update.run(['--dashboardid', dashboardId, '--currenthistoryid', currentHistoryId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('updateSuccess', [currentHistoryId]));
    expect(requestBody, 'request body').to.deep.equal({ currentHistoryId });
  });

  it(`runs: --dashboardid ${dashboardId} --removecurrenthistory`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'PATCH') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: dashboardId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Update.run(['--dashboardid', dashboardId, '--removecurrenthistory']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('updateRemoveSuccess', []));
    expect(requestBody, 'request body').to.deep.equal({ currentHistoryId: '' });
  });

  it(`runs: --dashboardid ${dashboardId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'PATCH') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: dashboardId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Update.run(['--dashboardid', dashboardId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('updateRemoveSuccess', []));
    expect(requestBody, 'request body').to.deep.equal({ currentHistoryId: '' });
  });
});
