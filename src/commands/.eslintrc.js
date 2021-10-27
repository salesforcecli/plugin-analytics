/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = {
  extends: '../../.eslintrc.js',
  rules: {
    // we don't support any api usages of the commands, so we don't need to enforce return types decls
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  }
};
