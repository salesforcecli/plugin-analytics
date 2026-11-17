/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages, SfError } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { stubSfCommandUx, stubSpinner } from '@salesforce/sf-plugins-core';
import { JsonMap } from '@salesforce/ts-types';
import { expect } from 'chai';
import { stubMethod } from '@salesforce/ts-sinon';
import Delete from '../../../../src/commands/analytics/autoinstall/app/delete.js';
import { AutoInstallRequestType, AutoInstallStatus } from '../../../../src/lib/analytics/autoinstall/autoinstall.js';
import { getStdout, stubDefaultOrg, stubAutoInstallRequests } from '../../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

const requestId = '0UZ6g000000E9qXGAS';
const folderId = '0llxx000000000zCAA';
function requestWithStatus(status: AutoInstallStatus): AutoInstallRequestType & JsonMap {
  return {
    id: requestId,
    requestType: 'WaveAppDelete',
    requestName: 'AutoInstallRequest WaveAppDelete',
    requestStatus: status,
    templateApiName: 'abc',
    folderId,
    folderLabel: 'abcde',
  };
}

function stubTimeout(callback?: () => unknown) {
  callback?.();
}

describe('analytics:autoinstall:app:delete', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let pollRequest: ReturnType<typeof stubAutoInstallRequests>['pollRequest'];

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    stubSpinner($$.SANDBOX);
    ({ pollRequest } = stubAutoInstallRequests($$, requestWithStatus('New')));
    // have the polling happen immediately
    stubMethod($$.SANDBOX, global, 'setTimeout').callsFake(stubTimeout);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --async -f ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);

    await Delete.run(['--async', '-f', folderId]);
    expect(pollRequest.callCount, 'install polls').to.equal(0);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appDeleteRequestSuccess', [requestId]));
  });

  it(`runs: --wait 0 -f ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);

    // --wait 0 should be the same as --async so this should return right away
    await Delete.run(['--wait', '0', '-f', folderId]);
    expect(pollRequest.callCount, 'install polls').to.equal(0);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appDeleteRequestSuccess', [requestId]));
  });

  it(`runs: -f ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);

    await Delete.run(['-f', folderId]);
    expect(pollRequest.callCount, 'install polls').to.equal(2);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appDeleteSuccess', [folderId, requestId]));
  });

  it(`runs: -f ${folderId} (with failure)`, async () => {
    await stubDefaultOrg($$, testOrg);
    pollRequest.onSecondCall().resolves(requestWithStatus('Failed'));

    try {
      await Delete.run(['-f', folderId]);
    } catch (error) {
      expect(pollRequest.callCount, 'install polls').to.equal(2);
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain(messages.getMessage('appDeleteFailed', [requestId]));
      return;
    }
    expect.fail('Expected an error');
  });

  it(`runs: -f ${folderId} (cancelled)`, async () => {
    await stubDefaultOrg($$, testOrg);
    pollRequest.onSecondCall().resolves(requestWithStatus('Cancelled'));

    try {
      await Delete.run(['-f', folderId]);
    } catch (error) {
      expect(pollRequest.callCount, 'install polls').to.equal(2);
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain(messages.getMessage('requestCancelled', [requestId]));
      return;
    }
    expect.fail('Expected an error');
  });

  it(`runs: -f ${folderId} -w .001 (timeout)`, async () => {
    await stubDefaultOrg($$, testOrg);
    const clock = $$.SANDBOX.useFakeTimers({ toFake: ['Date'] });
    pollRequest.resetBehavior();
    pollRequest.callsFake(() => {
      clock.tick(30);
      return Promise.resolve(requestWithStatus('InProgress'));
    });

    try {
      await Delete.run(['-f', folderId, '-w', '.001']);
    } catch (error) {
      expect(pollRequest.callCount, 'install polls').to.equal(2);
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain(
        messages.getMessage('requestPollingTimeout', [requestId, 'InProgress'])
      );
      return;
    }
    expect.fail('Expected an error');
  });

  it(`runs: -f ${folderId} (with error)`, async () => {
    await stubDefaultOrg($$, testOrg);
    pollRequest.onSecondCall().rejects(new SfError('expected error in polling'));

    try {
      await Delete.run(['-f', folderId]);
    } catch (error) {
      expect(pollRequest.callCount, 'install polls').to.equal(2);
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain('expected error in polling');
      return;
    }
    expect.fail('Expected an error');
  });
});
