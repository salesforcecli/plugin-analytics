/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { core } from '@salesforce/command';
import { expect, test } from '@salesforce/command/lib/test';
import { ensureJsonMap, ensureString } from '@salesforce/ts-types';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'app');

describe('analytics:app:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ folders: [] }))
    .stdout()
    .command(['analytics:app:list', '--folderid', '0llxx000000000zCAA'])
    .it('runs analytics:app:list  --folderid 0llxx000000000zCAA', ctx => {
      expect(ctx.stdout).to.contain('No results found.');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      // make sure the entity encoding header gets sent along
      if (ensureJsonMap(request.headers)['X-Chatter-Entity-Encoding'] === 'false') {
        return Promise.resolve({
          folders: [
            {
              name: 'SharedApp',
              label: 'Shared App',
              folderid: '00lT1000000DfqRIAS',
              status: 'newstatus'
            }
          ]
        });
      }
      return Promise.reject(new Error('Missing X-Chatter-Entity-Encoding: false header'));
    })
    .stdout()
    .stderr()
    .command(['analytics:app:list'])
    .it('runs analytics:app:list', ctx => {
      // the reject() above will be in stderr if the header is missing
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout).to.contain(messages.getMessage('appsFound', [1]));
    });

  // test multiple pages
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url, 'request.url is not a string, got ' + String(request.url));
      // the initial (page 1) url is /wave/folders/
      if (url.endsWith('/folders/')) {
        return Promise.resolve({
          folders: [
            {
              name: 'SharedApp',
              label: 'Shared App',
              folderid: '00lT1000000DfqRIAS',
              status: 'newstatus'
            }
          ],
          nextPageUrl: '/page2'
        });
      } else if (url.endsWith('/page2')) {
        return Promise.resolve({
          folders: [
            {
              name: 'App2',
              label: 'App2',
              folderid: '00lT1000000DfqRIAT',
              status: 'completedstatus'
            }
          ],
          nextPageUrl: '/page3'
        });
      } else if (url.endsWith('/page3')) {
        return Promise.resolve({
          folders: [
            {
              name: 'App3',
              label: 'App3',
              folderid: '00lT1000000DfqRIAU',
              status: 'completedstatus'
            }
          ]
          // no nextPageUrl
        });
      }

      return Promise.reject(`unknown url: ${url}`);
    })
    .stdout()
    .stderr()
    .command(['analytics:app:list'])
    .it('runs analytics:app:list (with mulitple pages)', ctx => {
      // the reject() above will be in stderr if the url doesn't come through
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout).to.contain(messages.getMessage('appsFound', [3]));
    });
});
