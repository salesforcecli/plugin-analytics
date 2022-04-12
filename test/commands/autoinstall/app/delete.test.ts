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
import { JsonMap } from '@salesforce/ts-types';
import { AutoInstallRequestType, AutoInstallStatus } from '../../../../src/lib/analytics/autoinstall/autoinstall';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'autoinstall');

function requestWithStatus(status: AutoInstallStatus): AutoInstallRequestType & JsonMap {
  return {
    id: '0UZ6g000000E9qXGAS',
    requestType: 'WaveAppDelete',
    requestName: 'AutoInstallRequest WaveAppDelete',
    requestStatus: status,
    templateApiName: 'abc',
    folderId: '0llxx000000000zCAA',
    folderLabel: 'abcde'
  };
}

function stubTimeout(callback?: () => unknown) {
  callback?.();
}

describe('analytics:autoinstall:app:delete', () => {
  // use this so we can have return different values from withConnectionRequest() to simulate polling
  let requestNum: number;
  beforeEach(() => {
    requestNum = 0;
  });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(requestWithStatus('New')))
    .stdout()
    .command(['analytics:autoinstall:app:delete', '--async', '-f', '0llxx000000000zCAA'])
    .it('runs analytics:autoinstall:app:delete --async', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('appDeleteRequestSuccess', ['0UZ6g000000E9qXGAS']));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(requestWithStatus('New')))
    .stdout()
    // --wait 0 should be the same as --async so this should return right away
    .command(['analytics:autoinstall:app:delete', '--wait', '0', '-f', '0llxx000000000zCAA'])
    .it('runs analytics:autoinstall:app:delete --wait 0', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('appDeleteRequestSuccess', ['0UZ6g000000E9qXGAS']));
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
    .command(['analytics:autoinstall:app:delete', '-f', '0llxx000000000zCAA'])
    .it('runs analytics:autoinstall:app:delete with Success status', ctx => {
      expect(ctx.stdout).to.contain(
        messages.getMessage('appDeleteSuccess', ['0llxx000000000zCAA', '0UZ6g000000E9qXGAS'])
      );
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
    .command(['analytics:autoinstall:app:delete', '-f', '0llxx000000000zCAA'])
    .it('runs analytics:autoinstall:app:delete with Failed status', ctx => {
      expect(ctx.stderr).to.contain(messages.getMessage('appDeleteFailed', ['0UZ6g000000E9qXGAS']));
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
    .command(['analytics:autoinstall:app:delete', '-f', '0llxx000000000zCAA'])
    .it('runs analytics:autoinstall:app:delete with Cancelled status', ctx => {
      expect(ctx.stderr).to.contain(messages.getMessage('requestCancelled', ['0UZ6g000000E9qXGAS']));
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
    .command(['analytics:autoinstall:app:delete', '-f', '0llxx000000000zCAA', '-w', '.001'])
    .it('runs analytics:autoinstall:app:delete with timeout in polling', ctx => {
      expect(ctx.stderr).to.contain(messages.getMessage('requestPollingTimeout', ['0UZ6g000000E9qXGAS', 'InProgress']));
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
    .command(['analytics:autoinstall:app:delete', '-f', '0llxx000000000zCAA'])
    .it('runs analytics:autoinstall:app:delete with error during polling', ctx => {
      expect(ctx.stderr).to.contain('expected error in polling');
    });
});
