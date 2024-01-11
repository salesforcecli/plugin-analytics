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
import { JsonArray } from '@salesforce/ts-types';
import List from '../../../src/commands/analytics/template/list.js';
import {
  expectToHaveElementValue,
  getStdout,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

const templateValues = [
  { name: 'foo', label: 'Foo Label', id: '0Nkxx000000000zCAA' },
  { name: 'bar', label: 'Bar Label', id: 'file_based_template' },
];

describe('analytics:template:list', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  async function runAndVerify(args: string[], templates: JsonArray, verify: () => unknown) {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ templates });

    await List.run(args);
    verify();
  }

  it('runs', async () => {
    await runAndVerify([], templateValues, () => {
      expect(getStyledHeaders(sfCommandStubs), 'headers').to.contain(messages.getMessage('templatesFound', [1]));
      const { data } = getTableData(sfCommandStubs);
      expectToHaveElementValue(data, templateValues[0].name, 'table');
      expectToHaveElementValue(data, templateValues[0].label, 'table');
    });
  });

  it('runs: --includesalesforcetemplates', async () => {
    await runAndVerify(['--includesalesforcetemplates'], templateValues, () => {
      expect(getStyledHeaders(sfCommandStubs), 'headers').to.contain(messages.getMessage('templatesFound', [2]));
      const { data } = getTableData(sfCommandStubs);
      expectToHaveElementValue(data, templateValues[0].name, 'table');
      expectToHaveElementValue(data, templateValues[0].label, 'table');
      expectToHaveElementValue(data, templateValues[1].name, 'table');
      expectToHaveElementValue(data, templateValues[1].label, 'table');
    });
  });

  it('runs: --includembeddedtemplates', async () => {
    await runAndVerify([], templateValues, () => {
      expect(getStyledHeaders(sfCommandStubs), 'headers').to.contain(messages.getMessage('templatesFound', [1]));
      const { data } = getTableData(sfCommandStubs);
      expectToHaveElementValue(data, templateValues[0].name, 'table');
      expectToHaveElementValue(data, templateValues[0].label, 'table');
    });
  });

  it('runs (no templates)', async () => {
    await runAndVerify([], templateValues, () => {
      expect(getStdout(sfCommandStubs), 'stdout').to.contain('No results found.');
      expect(getTableData(sfCommandStubs).data, 'table data').to.be.undefined;
    });
  });
});
