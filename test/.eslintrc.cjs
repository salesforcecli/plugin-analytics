/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = {
  extends: '../.eslintrc.cjs',
  // Allow describe and it
  env: { mocha: true },
  plugins: ['mocha'],
  rules: {
    // Allow assert style expressions. i.e. expect(true).to.be.true
    'no-unused-expressions': 'off',
    'no-param-reassign': 'off',
    'mocha/no-identical-title': 'error',

    // Return types are defined by the source code. Allows for quick overwrites.
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Mocked out the methods that shouldn't do anything in the tests.
    '@typescript-eslint/no-empty-function': 'off',
    // Easily return a promise in a mocked method.
    '@typescript-eslint/require-await': 'off',
  },
};
