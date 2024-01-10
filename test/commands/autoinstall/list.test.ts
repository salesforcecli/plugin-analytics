/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/sf-plugins-core/lib/test';
core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'autoinstall');

const autoinstallValues = [
  {
    id: '0UZxx0000004FzkGAE',
    requestType: 'waveAppCreate',
    requestName: 'foo',
    requestStatus: 'Success',
    templateApiName: 'abc',
    folderId: '0llxx000000000zCAA',
    folderLabel: 'abcde',
  },
];

describe('analytics:autoinstall:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => {
      return Promise.resolve({ requests: autoinstallValues });
    })
    .stdout()
    .command(['analytics:autoinstall:list'])
    .it('runs analytics:autoinstall:list', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('autoinstallsFound', [1]));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => {
      return Promise.resolve({ requests: [] });
    })
    .stdout()
    .command(['analytics:autoinstall:list'])
    .it('runs analytics:autoinstall:list', (ctx) => {
      expect(ctx.stdout).to.contain('No results found.');
    });
});
