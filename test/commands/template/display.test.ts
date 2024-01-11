/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import { AnyJson } from '@salesforce/ts-types';
import Display from '../../../src/commands/analytics/template/display.js';
import {
  expectToHaveElementInclude,
  getStderr,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

const ID = '0Nkxx000000000zCAA';
// this is what the template json looks like (49+, at least)
const json = {
  summary: 'foo bar desc',
  id: ID,
  label: 'foo bar',
  name: 'foobar',
  namespace: 'myns',
  assetVersion: 50,
  templateType: 'embeddedapp',
  folderSource: {
    id: '005xx000001XB1RAAW',
  },
};

describe('analytics:template:display', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  async function runAndVerify(args: string[], response: AnyJson, expected: { label: string; name: string }) {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(response);

    await Display.run(args);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    expect(getStyledHeaders(sfCommandStubs), 'headers').to.contain(messages.getMessage('displayDetailHeader'));

    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementInclude(data, { value: expected.label }, 'table');
    expectToHaveElementInclude(data, { value: expected.name }, 'table');
  }

  it(`runs: --templateid ${ID}`, async () => {
    await runAndVerify(['--templateid', ID], json, json);
  });

  it(`runs: --templatename ${json.name}`, async () => {
    await runAndVerify(['--templatename', json.name], json, json);
  });
});
