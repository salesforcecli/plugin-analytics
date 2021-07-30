/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { core } from '@salesforce/command';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'template');

const ID = '0Nkxx000000000zCAA';
// this is what the template json looks like (49+, at least)
const json = {
  description: 'foo bar desc',
  id: ID,
  label: 'foo bar',
  name: 'foobar',
  namespace: 'myns',
  assetVersion: 50,
  templateType: 'embeddedapp',
  folderSource: {
    id: '005xx000001XB1RAAW'
  }
};

describe('analytics:template:display', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(json))
    .stdout()
    .command(['analytics:template:display', '--templateid', ID])
    .it(`runs analytics:template:display --templateid ${ID}`, ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('displayDetailHeader'));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(json))
    .stdout()
    .command(['analytics:template:display', '--templatename', 'foo'])
    .it('runs analytics:template:display --templatename foo', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('displayDetailHeader'));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.reject(new Error('Should not have been called.')))
    .stderr()
    .command(['analytics:template:display'])
    .it('runs analytics:template:display', ctx => {
      expect(ctx.stderr).to.contain(messages.getMessage('missingRequiredField'));
    });
});
