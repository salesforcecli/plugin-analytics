/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import { ensureJsonMap, ensureString } from '@salesforce/ts-types';
import List from '../../../src/commands/analytics/app/list.js';
import {
  expectToHaveElementValue,
  getStdout,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

const folderId = '0llxx000000000zCAA';
describe('analytics:app:list', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --folderid ${folderId} (no results)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ folders: [] });

    await List.run(['--folderid', folderId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('noResultsFound'));
    expect(getTableData(sfCommandStubs).data, 'table').to.be.undefined;
  });

  it('runs', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      // make sure the entity encoding header gets sent along
      if (ensureJsonMap(request.headers)['X-Chatter-Entity-Encoding'] === 'false') {
        return Promise.resolve({
          folders: [
            {
              name: 'SharedApp',
              label: 'Shared App',
              id: folderId,
              status: 'newstatus',
            },
          ],
        });
      }
      return Promise.reject(new Error('Missing X-Chatter-Entity-Encoding: false header'));
    };

    await List.run([]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('appsFound', [1]));
    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementValue(data, folderId, 'table');
    expectToHaveElementValue(data, 'Shared App', 'table');
  });

  // test multiple pages
  it('runs (multiple pages)', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
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
              status: 'newstatus',
            },
          ],
          nextPageUrl: '/page2',
        });
      } else if (url.endsWith('/page2')) {
        return Promise.resolve({
          folders: [
            {
              name: 'App2',
              label: 'App2',
              folderid: '00lT1000000DfqRIAT',
              status: 'completedstatus',
            },
          ],
          nextPageUrl: '/page3',
        });
      } else if (url.endsWith('/page3')) {
        return Promise.resolve({
          folders: [
            {
              name: 'App3',
              label: 'App3',
              folderid: '00lT1000000DfqRIAU',
              status: 'completedstatus',
            },
          ],
          // no nextPageUrl
        });
      }

      return Promise.reject(`unknown url: ${url}`);
    };

    await List.run([]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('appsFound', [3]));
    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementValue(data, 'SharedApp', 'table');
    expectToHaveElementValue(data, 'App2', 'table');
    expectToHaveElementValue(data, 'App3', 'table');
  });
});
