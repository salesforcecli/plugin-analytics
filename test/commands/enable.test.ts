/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages, SfError } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx, stubSpinner } from '@salesforce/sf-plugins-core';
import { stubMethod } from '@salesforce/ts-sinon';
import { JsonMap, ensureJsonMap } from '@salesforce/ts-types';
import { expect } from 'chai';
import { AutoInstallRequestType, AutoInstallStatus } from '../../src/lib/analytics/autoinstall/autoinstall.js';
import Enable from '../../src/commands/analytics/enable.js';
import { getJsonOutput, getStderr, getStdout, stubDefaultOrg } from '../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

const DEFAULT_REQUEST_ID = '0UZ6g000000E9qDGAS';
function requestWithStatus(status: AutoInstallStatus, id = DEFAULT_REQUEST_ID): AutoInstallRequestType & JsonMap {
  return {
    id,
    requestType: 'WaveEnable',
    requestName: 'AutoInstallRequest WaveEnable',
    requestStatus: status,
  };
}

function stubTimeout(callback?: () => unknown) {
  callback?.();
}

describe('analytics:enable', () => {
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

  it('runs: --async', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(requestWithStatus('New'));

    const result = await Enable.run(['--async']);
    expect(result).to.equal(DEFAULT_REQUEST_ID);

    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('enableRequestSuccess', [DEFAULT_REQUEST_ID]));
  });

  it('runs: --wait 0', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(requestWithStatus('New'));

    const result = await Enable.run(['--wait', '0']);
    expect(result, 'result').to.equal(DEFAULT_REQUEST_ID);

    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('enableRequestSuccess', [DEFAULT_REQUEST_ID]));
  });

  it('runs with Success status', async () => {
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

    const result = await Enable.run([]);
    expect(typeof result, 'result type').to.equal('object');
    expect((result as AutoInstallRequestType).id, 'request id').to.equal(DEFAULT_REQUEST_ID);
    expect((result as AutoInstallRequestType).requestStatus, 'request status').to.equal('Success');

    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('enableSuccess', [DEFAULT_REQUEST_ID]));
  });

  it('runs with Failed status', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestNum = 0;
    $$.fakeConnectionRequest = () => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      if (requestNum === 3) {
        return Promise.resolve(requestWithStatus('Failed'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    };

    try {
      await Enable.run(['--json']);
    } catch (e: unknown) {
      expect(e, 'error').to.be.instanceOf(SfError);
      expect((e as SfError).message, 'error message').to.contain(
        messages.getMessage('enableFailed', [DEFAULT_REQUEST_ID])
      );
      // oclif strips out the data field from the original SfError for the error that gets thrown out of run(), but it
      // does log it in the output json for --json
      const json = getJsonOutput(sfCommandStubs);
      expect(ensureJsonMap(json).data, 'json data field').to.include({
        id: DEFAULT_REQUEST_ID,
        requestStatus: 'Failed',
      });
      return;
    }
    expect.fail('Expected an error');
  });

  it('runs with Cancelled status', async () => {
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
      await Enable.run([]);
    } catch (error: unknown) {
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'error message').to.contain(
        messages.getMessage('requestCancelled', [DEFAULT_REQUEST_ID])
      );
      return;
    }
    expect.fail('Expected an error');
  });

  it('runs with timeout in polling', async () => {
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
      await Enable.run(['--wait', '.001']);
    } catch (error) {
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'error message)').to.contain(
        messages.getMessage('requestPollingTimeout', ['0UZ6g000000E9qDGAS', 'InProgress'])
      );
      const stderr = getStderr(sfCommandStubs);
      expect(stderr, 'stderr').to.contain(
        messages.getMessage('requestPollingTimeout', ['0UZ6g000000E9qDGAS', 'InProgress'])
      );
      return;
    }
    expect.fail('Expected exception');
  });

  it('runs with error during polling', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestNum = 0;
    const errorMessage = 'expected error in polling';
    $$.fakeConnectionRequest = () => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      } else if (requestNum === 3) {
        return Promise.reject(new SfError(errorMessage));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    };

    try {
      await Enable.run([]);
    } catch (error) {
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'error message)').to.contain(errorMessage);
      const stderr = getStderr(sfCommandStubs);
      expect(stderr, 'stderr').to.contain(errorMessage);
      return;
    }
    expect.fail('Expected an error');
  });
});
