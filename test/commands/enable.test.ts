/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { core, UX } from '@salesforce/command';
import { expect, test } from '@salesforce/command/lib/test';
import { SfdxError } from '@salesforce/core';
import { JsonMap } from '@salesforce/ts-types';
import { AutoInstallRequestType, AutoInstallStatus } from '../../src/lib/analytics/autoinstall/autoinstall';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'autoinstall');

function requestWithStatus(status: AutoInstallStatus): AutoInstallRequestType & JsonMap {
  return {
    id: '0UZ6g000000E9qDGAS',
    requestType: 'WaveEnable',
    requestName: 'AutoInstallRequest WaveEnable',
    requestStatus: status
  };
}

function stubTimeout(callback?: () => unknown) {
  callback?.();
}

describe('analytics:enable', () => {
  // use this so we can have return different values from withConnectionRequest() to simulate polling
  let requestNum: number;
  beforeEach(() => {
    requestNum = 0;
  });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(requestWithStatus('New')))
    .stdout()
    .command(['analytics:enable', '--async'])
    .it('runs analytics:enable --async', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('enableRequestSuccess', ['0UZ6g000000E9qDGAS']));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(requestWithStatus('New')))
    .stdout()
    // --wait 0 should be the same as --async so this should return right away
    .command(['analytics:enable', '--wait', '0'])
    .it('runs analytics:enable --wait 0', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('enableRequestSuccess', ['0UZ6g000000E9qDGAS']));
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
    .command(['analytics:enable'])
    .it('runs analytics:enable with Success status', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('enableSuccess', ['0UZ6g000000E9qDGAS']));
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
    .command(['analytics:enable'])
    .it('runs analytics:enable with Failed status', ctx => {
      expect(ctx.stderr).to.contain(messages.getMessage('enableFailed', ['0UZ6g000000E9qDGAS']));
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
    .command(['analytics:enable'])
    .it('runs analytics:enable with Cancelled status', ctx => {
      expect(ctx.stderr).to.contain(messages.getMessage('requestCancelled', ['0UZ6g000000E9qDGAS']));
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
    .command(['analytics:enable', '-w', '.001'])
    .it('runs analytics:enable with timeout in polling', ctx => {
      expect(ctx.stderr).to.contain(messages.getMessage('requestPollingTimeout', ['0UZ6g000000E9qDGAS', 'InProgress']));
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
    .command(['analytics:enable'])
    .it('runs analytics:enable with error during polling', ctx => {
      expect(ctx.stderr).to.contain('expected error in polling');
    });
});
