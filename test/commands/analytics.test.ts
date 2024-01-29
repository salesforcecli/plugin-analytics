/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { ensureJsonMap, type JsonMap } from '@salesforce/ts-types';
import { expect } from 'chai';
import Analytics from '../../src/commands/analytics.js';
import { getJsonOutput, getStdout } from '../testutils.js';

describe('analytics', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it('runs: --json', async () => {
    const result = await Analytics.run(['--json']);
    expect(result?.adxVersion, 'result adxVersion').to.match(/^\d+\.\d+\.\d+$/);

    // make sure sfdx analytics --json returns adxVersion (as a semver string) in the output since other tools
    // (e.g. vscode) rely on this
    const json = ensureJsonMap(getJsonOutput(sfCommandStubs));
    expect(json.status, 'json status').to.equal(0);
    expect((json.result as JsonMap)?.adxVersion, 'json adxVersion').to.match(/^\d+\.\d+\.\d+$/);
  });

  it('runs', async () => {
    const result = await Analytics.run(['']);
    expect(result?.adxVersion, 'result adxVersion').to.match(/^\d+\.\d+\.\d+$/);

    // make sure sfdx analytics shows the big logo, the version, the links
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain('DX DX DX', 'should contain logo text');
    expect(stdout, 'stdout').to.match(/v\d+\.\d+\.\d+/, 'should contain version number');
    expect(stdout, 'stdout').to.contain('https://sfdc.co/', 'should contain doc links');
    expect(stdout, 'stdout').to.contain('analyticsdx-vscode', 'should contain vscode link');
  });
});
