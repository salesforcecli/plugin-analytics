/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { core } from '@salesforce/command';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'asset');

const publisherValues = [
  {
    id: '0dUxx00000002WTEAY',
    assetid: '0FKxx0000004GNwGAM',
    publisherUser: {
      id: '005xx000001XK37AAG',
      name: 'foo'
    }
  }
];

describe('analytics:asset:publisher:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ publishers: publisherValues }))
    .stdout()
    .command(['analytics:asset:publisher:list', '--assetid', '0FKxx0000004GNwGAM'])
    .it('runs analytics:asset:publisher:list --assetid 0FKxx0000004GNwGAM', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('publishersFound', [1, '0FKxx0000004GNwGAM']));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ publishers: [] }))
    .stdout()
    .command(['analytics:asset:publisher:list', '--assetid', '0FKxx0000004GNwGAM'])
    .it('runs analytics:asset:publisher:list --assetid 0FKxx0000004GNwGAM', ctx => {
      expect(ctx.stdout).to.contain('No results found.');
    });
});
