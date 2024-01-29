/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages, SfError } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx, stubSpinner } from '@salesforce/sf-plugins-core';
import { JsonMap } from '@salesforce/ts-types';
import { expect } from 'chai';
import { stubMethod } from '@salesforce/ts-sinon';
import Update from '../../../../src/commands/analytics/autoinstall/app/update.js';
import { AutoInstallRequestType, AutoInstallStatus } from '../../../../src/lib/analytics/autoinstall/autoinstall.js';
import { getStdout, stubDefaultOrg } from '../../../testutils.js';

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

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    stubSpinner($$.SANDBOX);
    // have the polling happen immediately
    stubMethod($$.SANDBOX, global, 'setTimeout').callsFake(stubTimeout);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --async -n abc -f ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(requestWithStatus('New'));

    await Update.run(['--async', '-n', 'abc', '-f', folderId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appUpdateRequestSuccess', [requestId]));
  });

  it(`runs: --wait 0 -n abc -f ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(requestWithStatus('New'));

    // --wait 0 should be the same as --async so this should return right away
    await Update.run(['--wait', '0', '-n', 'abc', '-f', folderId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appUpdateRequestSuccess', [requestId]));
  });

  it(`runs: -n abc -f ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestNum = 0;
    $$.fakeConnectionRequest = () => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      if (requestNum === 4) {
        return Promise.resolve(requestWithStatus('Success'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    };

    await Update.run(['-n', 'abc', '-f', folderId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appUpdateSuccess', [folderId, requestId]));
  });

  it(`runs: -n abc -f ${folderId} (with failure)`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestNum = 0;
    $$.fakeConnectionRequest = () => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      if (requestNum === 4) {
        return Promise.resolve(requestWithStatus('Failed'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    };

    try {
      await Update.run(['-n', 'abc', '-f', folderId]);
    } catch (error) {
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain(messages.getMessage('appUpdateFailed', [requestId]));
      return;
    }
    expect.fail('Expected an error');
  });

  it(`runs: -n abc -f ${folderId} (cancelled)`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestNum = 0;
    $$.fakeConnectionRequest = () => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      if (requestNum === 3) {
        return Promise.resolve(requestWithStatus('Cancelled'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    };

    try {
      await Update.run(['-n', 'abc', '-f', folderId]);
    } catch (error) {
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain(messages.getMessage('requestCancelled', [requestId]));
      return;
    }
    expect.fail('Expected an error');
  });

  it(`runs: -n abc -f ${folderId} -w .001 (timeout)`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestNum = 0;
    $$.fakeConnectionRequest = () => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    };

    try {
      await Update.run(['-n', 'abc', '-f', folderId, '-w', '.001']);
    } catch (error) {
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
    let requestNum = 0;
    $$.fakeConnectionRequest = () => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      if (requestNum === 3) {
        return Promise.reject(new SfError('expected error in polling'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    };

    try {
      await Update.run(['-n', 'abc', '-f', folderId]);
    } catch (error) {
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain('expected error in polling');
      return;
    }
    expect.fail('Expected an error');
  });
});
