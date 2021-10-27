/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect, test } from '@salesforce/command/lib/test';
import { JsonMap } from '@salesforce/ts-types';

describe('analytics', () => {
  // make sure sfdx analytics --json returns adxVersion (as a semver string) in the output since other tools
  // (e.g. vscode) rely on this
  test
    .stdout()
    .stderr()
    .command(['analytics', '--json'])
    .it('runs analytics --json', ctx => {
      // if it can't find the version, it'll console.warn() so make sure it didn't
      expect(ctx.stderr).to.equal('');

      expect(ctx.stdout).to.not.be.undefined.and.not.be.null.and.not.equal('');
      const results = JSON.parse(ctx.stdout) as JsonMap;
      expect(results, 'results').to.not.be.undefined;
      expect(results.status, 'status').to.equal(0);
      expect((results.result as JsonMap)?.adxVersion, 'adxVersion').to.match(/^\d+\.\d+\.\d+$/);
    });

  // make sure sfdx analytics shows the big logo, the version, the links
  test
    .stdout()
    .stderr()
    .command(['analytics'])
    .it('runs analytics', ctx => {
      expect(ctx.stderr).to.equal('');

      expect(ctx.stdout).to.not.be.undefined.and.not.be.null.and.not.equal('');
      expect(ctx.stdout, 'stdout').to.contain('DX DX DX', 'should contain logo text');
      expect(ctx.stdout, 'stdout').to.match(/v\d+\.\d+\.\d+/, 'should contain version number');
      expect(ctx.stdout, 'stdout').to.contain('https://sfdc.co/', 'should contain doc links');
      expect(ctx.stdout, 'stdout').to.contain('analyticsdx-vscode', 'should contain vscode link');
    });
});
