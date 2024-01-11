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
import List from '../../../../src/commands/analytics/asset/publisher/list.js';
import { getStdout, stubDefaultOrg } from '../../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'asset');

const assetId = '0FKxx0000004GNwGAM';
const publisherValues = [
  {
    id: '0dUxx00000002WTEAY',
    assetId,
    publisherUser: {
      id: '005xx000001XK37AAG',
      name: 'foo',
    },
  },
];

describe('analytics:asset:publisher:list', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --assetid ${assetId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ publishers: publisherValues });

    await List.run(['--assetid', assetId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('publishersFound', [1, assetId]));
    expect(stdout, 'stdout').to.contain(publisherValues[0].id);
    expect(stdout, 'stdout').to.contain(publisherValues[0].publisherUser.name);
  });

  it(`runs: --assetid ${assetId} (no results)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ publishers: [] });

    await List.run(['--assetid', assetId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain('No results found.');
    expect(stdout, 'stdout').to.not.contain(publisherValues[0].id);
    expect(stdout, 'stdout').to.not.contain(publisherValues[0].publisherUser.name);
  });
});
