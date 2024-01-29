/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import { Messages, SfError } from '@salesforce/core';
import Validate from '../../../src/commands/analytics/template/validate.js';
import {
  expectToHaveElementInclude,
  getStdout,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'validate');

const ID = '0Nkxx000000000zCAA';
const templateValues = {
  id: '0Nkxx000000000zCAA',
  tasks: [
    {
      label: 'TemplateAssociationTask',
      message: 'Certification for sfdc_internal__Sales_Analytics_Flex template.',
      readinessStatus: 'Complete',
    },
  ],
};
const templateWithFailedReadiness = {
  id: '0Nkxx000000000zCAA',
  tasks: [
    {
      label: 'EvaluateTemplateRequirement',
      message: "Expected number of accounts don't match. Expected: 100, Actual: 0",
      readinessStatus: 'Failed',
    },
  ],
};

describe('analytics:template:validate', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --templateid ${ID}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(templateValues);

    await Validate.run(['--templateid', ID]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain('Command only available in api version 58.0 or later');
  });

  it(`runs: --templateid ${ID} --apiversion 58.0`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(templateWithFailedReadiness);

    try {
      await Validate.run(['--templateid', ID, '--apiversion', '58.0']);
    } catch (error) {
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'error message').to.equal(messages.getMessage('validateFailed'));

      const { data, headers, headerLabels } = getTableData(sfCommandStubs);
      expect(headers, 'headers').to.deep.equal(['label', 'readinessStatus', 'message']);
      expect(headerLabels, 'headers').to.deep.equal(['Task', 'Status', 'Message']);
      expectToHaveElementInclude(data, templateWithFailedReadiness.tasks[0], 'table');
      expect(getStyledHeaders(sfCommandStubs), 'style headers').to.contain(
        messages.getMessage('tasksFound', [templateWithFailedReadiness.id])
      );
      return;
    }
    expect.fail('Expected error');
  });
});
