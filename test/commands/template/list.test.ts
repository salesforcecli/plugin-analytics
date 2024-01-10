/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/sf-plugins-core/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'template');

const templateValues = [
  { name: 'foo', label: 'Foo Label', id: '0Nkxx000000000zCAA' },
  { name: 'bar', label: 'Bar Label', id: 'file_based_template' },
];

describe('analytics:template:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ templates: templateValues }))
    .stdout()
    .command(['analytics:template:list'])
    .it('runs analytics:template:list', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('templatesFound', [1]));
      expect(ctx.stdout).to.contain(templateValues[0].name);
      expect(ctx.stdout).to.contain(templateValues[0].label);
      expect(ctx.stdout).to.not.contain(templateValues[1].name);
      expect(ctx.stdout).to.not.contain(templateValues[1].label);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ templates: templateValues }))
    .stdout()
    .command(['analytics:template:list', '--includesalesforcetemplates'])
    .it('runs analytics:template:list --includesalesforcetemplates', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('templatesFound', [2]));
      expect(ctx.stdout).to.contain(templateValues[0].name);
      expect(ctx.stdout).to.contain(templateValues[0].label);
      expect(ctx.stdout).to.contain(templateValues[1].name);
      expect(ctx.stdout).to.contain(templateValues[1].label);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ templates: templateValues }))
    .stdout()
    .command(['analytics:template:list', '--includembeddedtemplates'])
    .it('runs analytics:template:list --includembeddedtemplates', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('templatesFound', [1]));
      expect(ctx.stdout).to.contain(templateValues[0].name);
      expect(ctx.stdout).to.contain(templateValues[0].label);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ templates: [] }))
    .stdout()
    .command(['analytics:template:list'])
    .it('runs analytics:template:list', (ctx) => {
      expect(ctx.stdout).to.contain('No results found.');
      expect(ctx.stdout).to.not.contain(templateValues[0].id);
      expect(ctx.stdout).to.not.contain(templateValues[0].name);
      expect(ctx.stdout).to.not.contain(templateValues[0].label);
      expect(ctx.stdout).to.not.contain(templateValues[1].id);
      expect(ctx.stdout).to.not.contain(templateValues[1].name);
      expect(ctx.stdout).to.not.contain(templateValues[1].label);
    });
});
