/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/sf-plugins-core/lib/test';
import { ensureJsonMap } from '@salesforce/ts-types';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'asset');
const assetId = '0FKxx0000004GNwGAM';

describe('analytics:asset:publisher:deleteall', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest((request) => {
      request = ensureJsonMap(request);
      if (request.method === 'DELETE') {
        return Promise.resolve({ id: assetId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:asset:publisher:deleteall', '--assetid', assetId, '--noprompt'])
    .it('runs analytics:asset:publisher:deleteall --assetid 0FKxx0000004GNwGAM --noprompt', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('deletePublishersSuccess', [assetId]));
    });
});
