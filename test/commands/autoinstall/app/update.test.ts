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
import Update from '../../../../src/commands/analytics/autoinstall/app/update.js';
import { AutoInstallRequestType, AutoInstallStatus } from '../../../../src/lib/analytics/autoinstall/autoinstall.js';
import { getStdout, getStyledHeaders, stubDefaultOrg, stubAutoInstallRequests } from '../../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

const requestId = '0UZ6g000000E9qNGAS';
const folderId = '0llxx000000000zCAA';
function requestWithStatus(status: AutoInstallStatus): AutoInstallRequestType & JsonMap {
  return {
    id: requestId,
    requestType: 'WaveAppUpdate',
    requestName: 'foo',
    requestStatus: status,
    templateApiName: 'abc',
    folderId,
    folderLabel: 'abcde',
  };
}

function stubTimeout(callback?: () => unknown) {
  callback?.();
}

describe('analytics:autoinstall:app:update', () => {
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

  it(`runs: --async -n abc -f ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);

    await Update.run(['--async', '-n', 'abc', '-f', folderId]);
    expect(pollRequest.callCount, 'install polls').to.equal(0);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appUpdateRequestSuccess', [requestId]));
    expect(stdout, 'stdout').to.not.contain(messages.getMessage('displayNoLogAvailable'));
  });

  it(`runs: --wait 0 -n abc -f ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);

    // --wait 0 should be the same as --async so this should return right away
    await Update.run(['--wait', '0', '-n', 'abc', '-f', folderId]);
    expect(pollRequest.callCount, 'install polls').to.equal(0);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appUpdateRequestSuccess', [requestId]));
  });

  it(`runs: -n abc -f ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);

    await Update.run(['-n', 'abc', '-f', folderId]);
    expect(pollRequest.callCount, 'install polls').to.equal(2);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appUpdateSuccess', [folderId, requestId]));
    expect(stdout, 'stdout').to.not.contain(messages.getMessage('displayNoLogAvailable'));
  });

  it(`runs: -n abc -f ${folderId} --applog (with no app log)`, async () => {
    await stubDefaultOrg($$, testOrg);

    await Update.run(['-n', 'abc', '-f', folderId, '--applog']);
    expect(pollRequest.callCount, 'install polls').to.equal(2);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('displayLogHeader'));
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('displayNoLogAvailable'));
  });

  it(`runs: -n abc -f ${folderId} (with failure)`, async () => {
    await stubDefaultOrg($$, testOrg);
    pollRequest.onSecondCall().resolves(requestWithStatus('Failed'));

    try {
      await Update.run(['-n', 'abc', '-f', folderId]);
    } catch (error) {
      expect(pollRequest.callCount, 'install polls').to.equal(2);
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain(messages.getMessage('appUpdateFailed', [requestId]));
      return;
    }
    expect.fail('Expected an error');
  });

  it(`runs: -n abc -f ${folderId} (cancelled)`, async () => {
    await stubDefaultOrg($$, testOrg);
    pollRequest.onSecondCall().resolves(requestWithStatus('Cancelled'));

    try {
      await Update.run(['-n', 'abc', '-f', folderId]);
    } catch (error) {
      expect(pollRequest.callCount, 'install polls').to.equal(2);
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain(messages.getMessage('requestCancelled', [requestId]));
      return;
    }
    expect.fail('Expected an error');
  });

  it(`runs: -n abc -f ${folderId} -w .001 (timeout)`, async () => {
    await stubDefaultOrg($$, testOrg);
    const clock = $$.SANDBOX.useFakeTimers({ toFake: ['Date'] });
    pollRequest.resetBehavior();
    pollRequest.callsFake(() => {
      clock.tick(30);
      return Promise.resolve(requestWithStatus('InProgress'));
    });

    try {
      await Update.run(['-n', 'abc', '-f', folderId, '-w', '.001']);
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

  it(`runs: -n abc -f ${folderId} (with error)`, async () => {
    await stubDefaultOrg($$, testOrg);
    pollRequest.onSecondCall().rejects(new SfError('expected error in polling'));

    try {
      await Update.run(['-n', 'abc', '-f', folderId]);
    } catch (error) {
      expect(pollRequest.callCount, 'install polls').to.equal(2);
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain('expected error in polling');
      return;
    }
    expect.fail('Expected an error');
  });
});
