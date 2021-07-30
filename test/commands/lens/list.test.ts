/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { core } from '@salesforce/command';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'lens');

const lensValues = [
  { id: '0FKxx0000004D3UGAU', name: 'mylens', label: 'my lens' },
  { id: '0FKxx0000004D3UGAY', name: 'mylenswithns', namespace: 'SomeNs', label: 'my lens with namespace' }
];

describe('analytics:lens:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ lenses: lensValues }))
    .stdout()
    .command(['analytics:lens:list'])
    .it('runs analytics:lens:list', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('lensesFound', [2]));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ lenses: lensValues }))
    .stderr()
    .stdout()
    .command(['analytics:lens:list', '--json'])
    .it('runs analytics:lens:list --json', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(JSON.parse(ctx.stdout), 'stdout json').to.deep.equal({
        status: 0,
        result: [
          {
            lensid: lensValues[0].id,
            name: lensValues[0].name,
            label: lensValues[0].label
          },
          {
            lensid: lensValues[1].id,
            name: lensValues[1].name,
            namespace: lensValues[1].namespace,
            label: lensValues[1].label
          }
        ]
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ lenses: [] }))
    .stdout()
    .command(['analytics:lens:list'])
    .it('runs analytics:lens:list', ctx => {
      expect(ctx.stdout).to.contain('No results found.');
    });
});
