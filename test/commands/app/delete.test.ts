/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { core } from '@salesforce/command';
import { expect, test } from '@salesforce/command/lib/test';
import { ensureJsonMap } from '@salesforce/ts-types';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'app');
const appId = '0llxx000000000zCAA';

describe('analytics:app:delete', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'DELETE') {
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:app:delete', '--noprompt', '--folderid', appId])
    .it('runs analytics:app:delete  --folderid 0llxx000000000zCAA --noprompt', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('deleteAppSuccess', [appId]));
    });
});
