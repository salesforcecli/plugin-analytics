/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
module.exports = {
  extends: ['eslint-config-salesforce-typescript', 'eslint-config-salesforce-license', 'plugin:sf-plugin/recommended'],
  root: true,
  rules: {
    // this allows you to indent the 2nd line of an @param, which I think helps readability
    'jsdoc/check-indentation': ['error' | 'warn', { excludeTags: ['example', 'param'] }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    // we intentionally want getConnection() to use the server's highest version by default, so turn this off
    'sf-plugin/get-connection-with-version': 'off',
    // we had our messages done before this eslint rule existed, so turn if off for now
    'sf-plugin/no-hardcoded-messages-flags': 'off',
    // eslint doesn't like that we have a source folder called 'lib'
    'no-restricted-imports': 'off',
  },
};
