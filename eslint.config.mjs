import salesforce from 'eslint-config-salesforce-typescript';
import sfPlugin from 'eslint-plugin-sf-plugin';
import mocha from 'eslint-plugin-mocha';

export default [
  { ignores: ['.wireit/**'] },
  ...salesforce,
  ...sfPlugin.configs.recommended,
  {
    rules: {
      'header/header': [
        'error',
        'block',
        [
          '',
          { pattern: String.raw` \* Copyright \(c\) \d{4}, salesforce.com, inc.` },
          ' * All rights reserved.',
          ' * Licensed under the BSD 3-Clause license.',
          ' * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause',
          ' ',
        ],
      ],
      'jsdoc/check-indentation': ['error', { excludeTags: ['example', 'param'] }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'sf-plugin/no-hardcoded-messages-flags': 'off',
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    plugins: { mocha },
    rules: {
      'no-param-reassign': 'off',
      'mocha/no-identical-title': 'error',
    },
  },
];
