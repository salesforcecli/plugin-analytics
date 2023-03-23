/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { UX } from '@salesforce/command';
import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';
import { SfdxError } from '@salesforce/core';
import { AnyJson, ensureJsonMap, ensureString, JsonMap } from '@salesforce/ts-types';
import { AutoInstallRequestType, AutoInstallStatus } from '../../../../src/lib/analytics/autoinstall/autoinstall';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'autoinstall');

function requestWithStatus(status: AutoInstallStatus): AutoInstallRequestType & JsonMap {
  return {
    id: '0UZxx0000004FzkGAE',
    requestType: 'WaveAppCreate',
    requestName: 'foo',
    requestStatus: status,
    templateApiName: 'abc',
    folderId: '0llxx000000000zCAA',
    folderLabel: 'abcde'
  };
}

function stubTimeout(callback?: () => unknown) {
  callback?.();
}

describe('analytics:autoinstall:app:create', () => {
  let requestBody: AnyJson | undefined;
  function saveOffRequestBody(json: string | undefined) {
    requestBody = undefined;
    try {
      requestBody = json && (JSON.parse(json) as AnyJson);
    } catch (e) {
      expect.fail('Error parsing request body: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  // use this so we can have return different values from withConnectionRequest() to simulate polling
  let requestNum: number;
  beforeEach(() => {
    requestNum = 0;
    requestBody = undefined;
  });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(requestWithStatus('New')))
    .stdout()
    .command(['analytics:autoinstall:app:create', '--async', '-n', 'abc'])
    .it('runs analytics:autoinstall:app:create --async', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('appCreateRequestSuccess', ['0UZxx0000004FzkGAE']));
    });

  // verify the --json output includes the request id
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(requestWithStatus('New')))
    .stdout()
    .command(['analytics:autoinstall:app:create', '--async', '-n', 'abc', '--json'])
    .it('runs analytics:autoinstall:app:create --async --json', ctx => {
      expect(ctx.stdout).to.not.be.undefined.and.not.be.null.and.not.equal('');
      const results = JSON.parse(ctx.stdout) as unknown;
      expect(results, 'result').to.deep.include({
        status: 0,
        result: {
          id: '0UZxx0000004FzkGAE'
        }
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(requestWithStatus('New')))
    .stdout()
    // --wait 0 should be the same as --async so this should return right away
    .command(['analytics:autoinstall:app:create', '--wait', '0', '-n', 'abc'])
    .it('runs analytics:autoinstall:app:create --wait 0', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('appCreateRequestSuccess', ['0UZxx0000004FzkGAE']));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      if (requestNum === 4) {
        return Promise.resolve(requestWithStatus('Success'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    })
    // hide the output from the UX spinner, since it bypasses stdout()
    .stub(UX.prototype, 'startSpinner', () => {})
    .stub(UX.prototype, 'stopSpinner', () => {})
    // skip the delay in setTimeout() so the test runs faster
    .stub(global, 'setTimeout', stubTimeout)
    .stdout()
    .command(['analytics:autoinstall:app:create', '-n', 'abc'])
    .it('runs analytics:autoinstall:app:create with Success status', ctx => {
      expect(ctx.stdout).to.contain(
        messages.getMessage('appCreateSuccess', ['0llxx000000000zCAA', '0UZxx0000004FzkGAE'])
      );
    });

  // verfiy that --json on success includes the request id and the folder id
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      if (requestNum === 4) {
        return Promise.resolve(requestWithStatus('Success'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    })
    // hide the output from the UX spinner, since it bypasses stdout()
    .stub(UX.prototype, 'startSpinner', () => {})
    .stub(UX.prototype, 'stopSpinner', () => {})
    // skip the delay in setTimeout() so the test runs faster
    .stub(global, 'setTimeout', stubTimeout)
    .stdout()
    .command(['analytics:autoinstall:app:create', '-n', 'abc', '--json'])
    .it('runs analytics:autoinstall:app:create --json with Success status', ctx => {
      expect(ctx.stdout).to.not.be.undefined.and.not.be.null.and.not.equal('');
      const results = JSON.parse(ctx.stdout) as unknown;
      expect(results, 'result').to.deep.include({
        status: 0,
        result: {
          id: '0UZxx0000004FzkGAE',
          folderId: '0llxx000000000zCAA',
          requestType: 'WaveAppCreate',
          requestName: 'foo',
          requestStatus: 'Success',
          templateApiName: 'abc',
          folderLabel: 'abcde'
        }
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      if (requestNum === 3) {
        return Promise.resolve(requestWithStatus('Failed'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    })
    .stub(UX.prototype, 'startSpinner', () => {})
    .stub(UX.prototype, 'stopSpinner', () => {})
    .stub(global, 'setTimeout', stubTimeout)
    .stdout()
    .stderr()
    .command(['analytics:autoinstall:app:create', '-n', 'abc'])
    .it('runs analytics:autoinstall:app:create with Failed status', ctx => {
      expect(ctx.stderr).to.contain(messages.getMessage('appCreateFailed', ['0UZxx0000004FzkGAE']));
    });

  // verify that a failed create with --json returns the last auto-install request (which has the
  // request id and folder id)
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      if (requestNum === 3) {
        return Promise.resolve(requestWithStatus('Failed'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    })
    .stub(UX.prototype, 'startSpinner', () => {})
    .stub(UX.prototype, 'stopSpinner', () => {})
    .stub(global, 'setTimeout', stubTimeout)
    .stdout()
    .stderr()
    .command(['analytics:autoinstall:app:create', '-n', 'abc', '--json'])
    .it('runs analytics:autoinstall:app:create --json with Failed status', ctx => {
      // output seems to go to stdout in tests
      const output = ctx.stderr || ctx.stdout || '';
      expect(output, 'console output').to.not.equal('');
      const results = JSON.parse(output) as unknown;
      expect(results).to.deep.include({
        status: 1,
        message: messages.getMessage('appCreateFailed', ['0UZxx0000004FzkGAE']),
        exitCode: 1,
        // data should be the last auto-install request received
        data: {
          id: '0UZxx0000004FzkGAE',
          requestType: 'WaveAppCreate',
          requestName: 'foo',
          requestStatus: 'Failed',
          templateApiName: 'abc',
          folderId: '0llxx000000000zCAA',
          folderLabel: 'abcde'
        }
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      if (requestNum === 3) {
        return Promise.resolve(requestWithStatus('Cancelled'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    })
    .stub(UX.prototype, 'startSpinner', () => {})
    .stub(UX.prototype, 'stopSpinner', () => {})
    .stub(global, 'setTimeout', stubTimeout)
    .stdout()
    .stderr()
    .command(['analytics:autoinstall:app:create', '-n', 'abc'])
    .it('runs analytics:autoinstall:app:create with Cancelled status', ctx => {
      expect(ctx.stderr).to.contain(messages.getMessage('requestCancelled', ['0UZxx0000004FzkGAE']));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    })
    .stub(UX.prototype, 'startSpinner', () => {})
    .stub(UX.prototype, 'stopSpinner', () => {})
    .stub(global, 'setTimeout', stubTimeout)
    .stdout()
    .stderr()
    .command(['analytics:autoinstall:app:create', '-n', 'abc', '-w', '.001'])
    .it('runs analytics:autoinstall:app:create with timeout in polling', ctx => {
      expect(ctx.stderr).to.contain(messages.getMessage('requestPollingTimeout', ['0UZxx0000004FzkGAE', 'InProgress']));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => {
      requestNum++;
      if (requestNum === 1) {
        return Promise.resolve(requestWithStatus('New'));
      } else if (requestNum === 3) {
        return Promise.reject(new SfdxError('expected error in polling'));
      }
      return Promise.resolve(requestWithStatus('InProgress'));
    })
    .stub(UX.prototype, 'startSpinner', () => {})
    .stub(UX.prototype, 'stopSpinner', () => {})
    .stub(global, 'setTimeout', stubTimeout)
    .stdout()
    .stderr()
    .command(['analytics:autoinstall:app:create', '-n', 'abc'])
    .it('runs analytics:autoinstall:app:create with error during polling', ctx => {
      expect(ctx.stderr).to.contain('expected error in polling');
    });

  // Test that --appname and --appdescription values appear in the request body
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(async request => {
      request = ensureJsonMap(request);
      saveOffRequestBody(ensureString(request.body));
      return requestWithStatus('New');
    })
    .stdout()
    .command([
      'analytics:autoinstall:app:create',
      '--async',
      '-n',
      'abc',
      '--appname',
      'customname',
      '--appdescription',
      'customdesc'
    ])
    .it('runs analytics:autoinstall:app:create --async --appname customname --appdescription customdesc', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('appCreateRequestSuccess', ['0UZxx0000004FzkGAE']));
      expect(requestBody, 'requestBody').to.have.nested.include({
        'configuration.appConfiguration.appLabel': 'customname',
        'configuration.appConfiguration.appName': 'customname',
        'configuration.appConfiguration.appDescription': 'customdesc'
      });
    });
});
