/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import Validate from '../../../src/commands/analytics/template/validate.js';
import { getStdout, stubDefaultOrg } from '../../testutils.js';

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

  describe('(with failure)', () => {
    const exitCode = process.exitCode;
    after(() => {
      process.exitCode = exitCode;
    });

    it(`runs: --templateid ${ID} --apiversion 58.0`, async () => {
      await stubDefaultOrg($$, testOrg);
      $$.fakeConnectionRequest = () => Promise.resolve(templateWithFailedReadiness);

      await Validate.run(['--templateid', ID, '--apiversion', '58.0']);
      expect(process.exitCode).to.equal(1);
    });
  });
});
