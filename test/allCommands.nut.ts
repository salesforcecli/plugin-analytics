/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd } from '@salesforce/cli-plugins-testkit';
import { expect } from '@salesforce/command/lib/test';
import { JsonMap } from '@salesforce/ts-types';

describe('verifies all command run successfully', () => {
  // TODO: add tests that:
  // - create a scratch org
  // - do analytics:enable (which should correctly no-op in scratch org)
  // - create an app (w/ a dataflow, dataset, dashboard, lens, etc.)
  // - verify those assets
  // - fetch rows from the dataset
  // - run queries against the dataset
  // - do dashboard publisher stuff
  // - do history stuff
  // - create an embedded app via autoinstall, verify autoinstall stuff
  // See https://github.com/salesforcecli/plugin-user/blob/main/test/allCommands.nut.ts for reference for using
  // TestSesssion from cli-plugins-testkit

  it('analytics --json', () => {
    const output = execCmd<JsonMap>('analytics --json', { ensureExitCode: 0 }).jsonOutput;
    expect(output, 'output').to.not.be.undefined;
    const result = (output as JsonMap).result as JsonMap;
    expect(result, 'result').to.not.be.undefined;
    expect(result?.adxVersion, 'adxVersion').to.match(/^\d+\.\d+\.\d+$/);
  });
});
