/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = {
  extends: '../../.eslintrc.cjs',
  rules: {
    // we don't support any api usages of the commands, so we don't need to enforce return types decls
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // TODO: add startsWith's to all the Flags.salesforceId()
    'sf-plugin/id-flag-suggestions': 'off',
    // all our awaits-in-loops are intentional (e.g. either need previous result, or want to to do 1-at-a-time)
    'no-await-in-loop': 'off',
  },
};
