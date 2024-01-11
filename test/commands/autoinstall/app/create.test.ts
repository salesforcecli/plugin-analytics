/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages, SfError } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx, stubSpinner } from '@salesforce/sf-plugins-core';
import { AnyJson, JsonMap, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import { expect } from 'chai';
import { stubMethod } from '@salesforce/ts-sinon';
import Create from '../../../../src/commands/analytics/autoinstall/app/create.js';
import { AutoInstallRequestType, AutoInstallStatus } from '../../../../src/lib/analytics/autoinstall/autoinstall.js';
import { getStderr, getStdout, stubDefaultOrg } from '../../../testutils.js';
import { fs } from '../../../../src/lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

const testAppConfigJson = {
  appName: 'foo',
  appLabel: 'foo label',
  appDescription: 'foo description',
  failOnDuplicateNames: false,
  autoShareWithLicensedUsers: false,
  autoShareWithOriginator: false,
  deleteAppOnConstructionFailure: false,
  dataRefreshSchedule: {
    time: {
      hour: 2,
      minute: 35,
      timezone: {
        zoneId: 'PST',
      },
    },
    daysOfWeek: ['monday'],
    frequency: 'weekly',
  },
};

const requestId = '0UZxx0000004FzkGAE';
const folderId = '0llxx000000000zCAA';

function requestWithStatus(status: AutoInstallStatus): AutoInstallRequestType & JsonMap {
  return {
    id: requestId,
    requestType: 'WaveAppCreate',
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

describe('analytics:autoinstall:app:create', () => {
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

  it('runs --async -n abc', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(requestWithStatus('New'));

    await Create.run(['--async', '-n', 'abc']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appCreateRequestSuccess', [requestId]));
  });

  // verify the --json output includes the request id
  it('runs --async -n abc --json', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(requestWithStatus('New'));

    await Create.run(['--async', '-n', 'abc', '--json']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.equal('');
    expect(JSON.parse(stdout), 'stdout json').to.deep.include({
      status: 0,
      result: {
        id: requestId,
      },
    });
  });

  it('runs --wait 0 -n abc', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(requestWithStatus('New'));

    const newLocal = '0';
    // --wait 0 should be the same as --async so this should return right away
    await Create.run(['--wait', newLocal, '-n', 'abc']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appCreateRequestSuccess', [requestId]));
  });

  it('runs: -n abc', async () => {
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

    await Create.run(['-n', 'abc']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appCreateSuccess', [folderId, requestId]));
  });

  // verfiy that --json on success includes the request id and the folder id
  it('runs: -n abc --json', async () => {
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

    await Create.run(['-n', 'abc']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.not.equal('');
    expect(JSON.parse(stdout), 'stdout json').to.deep.include({
      status: 0,
      result: {
        id: requestId,
        folderId,
        requestType: 'WaveAppCreate',
        requestName: 'foo',
        requestStatus: 'Success',
        templateApiName: 'abc',
        folderLabel: 'abcde',
      },
    });
  });

  it('runs: -n abc (with failure)', async () => {
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

    await Create.run(['-n', 'abc']);
    const stderr = getStderr(sfCommandStubs);
    expect(stderr, 'stderr').to.contain(messages.getMessage('appCreateFailed', [requestId]));
  });

  // verify that a failed create with --json returns the last auto-install request (which has the
  // request id and folder id)
  it('runs: -n abc --json (with failure)', async () => {
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

    await Create.run(['-n', 'abc', '--json']);
    const stderr = getStderr(sfCommandStubs);
    expect(stderr, 'console output').to.not.equal('');
    expect(stderr, 'result json').to.deep.include({
      status: 1,
      message: messages.getMessage('appCreateFailed', [requestId]),
      exitCode: 1,
      // data should be the last auto-install request received
      data: {
        id: requestId,
        requestType: 'WaveAppCreate',
        requestName: 'foo',
        requestStatus: 'Failed',
        templateApiName: 'abc',
        folderId,
        folderLabel: 'abcde',
      },
    });
  });

  it('runs: -n abc (cancelled)', async () => {
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

    await Create.run(['-n', 'abc']);
    const stderr = getStderr(sfCommandStubs);
    expect(stderr, 'stderr').to.contain(messages.getMessage('requestCancelled', [requestId]));
  });

  it('runs: -n abc (skipped)', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestNum = 0;
    $$.fakeConnectionRequest = () => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      if (requestNum === 3) {
        return Promise.resolve(requestWithStatus('Skipped'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    };

    await Create.run(['-n', 'abc']);
    const stderr = getStderr(sfCommandStubs);
    expect(stderr, 'stderr').to.contain(messages.getMessage('requestSkipped', [requestId]));
  });

  it('runs: -n abc -w .001 (timeout)', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestNum = 0;
    $$.fakeConnectionRequest = () => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    };

    await Create.run(['-n', 'abc', '-w', '.001']);
    const stderr = getStderr(sfCommandStubs);
    expect(stderr, 'stderr').to.contain(messages.getMessage('requestPollingTimeout', [requestId, 'InProgress']));
  });

  it('runs: -n abc (with error)', async () => {
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

    await Create.run(['-n', 'abc']);
    const stderr = getStderr(sfCommandStubs);
    expect(stderr, 'stderr').to.contain('expected error in polling');
  });

  // Test that --appname and --appdescription values appear in the request body
  it('runs: --async -n abc --appname customname --appdescription customdesc', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
      return Promise.resolve(requestWithStatus('New'));
    };

    await Create.run(['--async', '-n', 'abc', '--appname', 'customname', '--appdescription', 'customdesc']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appCreateRequestSuccess', [requestId]));
    expect(requestBody, 'requestbody ').to.have.nested.include({
      'configuration.appConfiguration.appLabel': 'customname',
      'configuration.appConfiguration.appName': 'customname',
      'configuration.appConfiguration.appDescription': 'customdesc',
    });
  });

  it('runs: --appconfiguration config/foo.json --async -n abc', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
      return Promise.resolve(requestWithStatus('New'));
    };
    stubMethod($$.SANDBOX, fs, 'readFile').resolves(JSON.stringify(testAppConfigJson));

    await Create.run(['--appconfiguration', 'config/foo.json', '--async', '-n', 'abc']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('appCreateRequestSuccess', [requestId]));
    expect(requestBody, 'request body').to.deep.include({
      configuration: {
        appConfiguration: testAppConfigJson,
      },
    });
  });
});
