/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
// const messages = core.Messages.loadMessages('@salesforce/analytics', 'validate');
const ID = '0Nkxx000000000zCAA';
const templateValues = [
  {
    id: '0Nkxx000000000zCAA',
    tasks: [
      {
        label: 'TemplateAssociationTask',
        message: 'Certification for sfdc_internal__Sales_Analytics_Flex template.',
        readinessStatus: 'Complete'
      }
    ]
  }
];

describe('analytics:template:validate', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ result: templateValues }))
    .stdout()
    .command(['analytics:template:validate', '--templateid', ID])
    .it(`runs analytics:template:validate --templateid ${ID}`, ctx => {
      expect(ctx.stdout).to.contain('Command only available in api version 58.0 or later');
    });
});

const templateWithFailedReadiness = [
  {
    id: '0Nkxx000000000zCAA',
    tasks: [
      {
        label: 'EvaluateTemplateRequirement',
        message: "Expected number of accounts don't match. Expected: 100, Actual: 0",
        readinessStatus: 'Failed'
      }
    ]
  }
];

describe('analytics:template:validate failure', () => {
  const exitCode = process.exitCode;
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(templateWithFailedReadiness))
    .command(['analytics:template:validate', '--templateid', ID, '--apiversion', '58.0'])
    .it(`runs analytics:template:validate --templateid ${ID}`, () => {
      expect(process.exitCode).to.equal(1);
    });

  after(() => {
    process.exitCode = exitCode;
  });
});
