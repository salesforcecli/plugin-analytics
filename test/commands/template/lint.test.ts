/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
// const messages = core.Messages.loadMessages('@salesforce/analytics', 'lint');
const ID = '0Nkxx000000000zCAA';
const templateValues = [
  {
    label: 'sfdc_internal__Sales_Analytics_Flex',
    score: 85.6,
    tasks: [
      {
        label: 'TemplateAssociationTask',
        message: 'Certification for sfdc_internal__Sales_Analytics_Flex template.',
        readinessStatus: 'Complete'
      }
    ]
  }
];

describe('analytics:template:lint', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ result: templateValues }))
    .stdout()
    .command(['analytics:template:lint', '--templateid', ID])
    .it(`runs analytics:template:lint --templateid ${ID}`, ctx => {
      expect(ctx.stdout).to.contain('Command only available in api version 58.0 or later');
    });
});