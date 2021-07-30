/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { core } from '@salesforce/command';
import { expect, test } from '@salesforce/command/lib/test';
import { ensureJsonMap } from '@salesforce/ts-types';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'template');
const templateId = '0Nkxx000000000zCAA';
const templateName = 'myTemplate';

describe('analytics:template:update', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        return Promise.resolve({ folders: [], templates: [] });
      }
      if (request.method === 'POST') {
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:update', '--templateid', '0Nkxx000000000zCAA'])
    .it('runs analytics:template:update  --templateid 0Nkxx000000000zCAA ', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('errorNoFolderFound', [templateId]));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        return Promise.resolve({ folders: [], templates: [] });
      }
      if (request.method === 'POST') {
        return Promise.resolve({ id: '0llxx000000000zCAA' });
      }
      if (request.method === 'PUT') {
        return Promise.resolve({ id: templateId, name: templateName });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:update', '--templateid', '0Nkxx000000000zCAA', '--folderid', '0llxx000000000zCAA'])
    .it('runs analytics:template:update  --templateid 0Nkxx000000000zCAA --folderid 0llxx000000000zCAA', ctx => {
      expect(ctx.stdout).to.contain(
        messages.getMessage('updateSuccess', [templateName, templateId, '0llxx000000000zCAA'])
      );
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        return Promise.resolve({ folders: [], templates: [] });
      }
      if (request.method === 'POST') {
        return Promise.resolve({ id: '0llxx000000000zCAA' });
      }
      if (request.method === 'PUT') {
        return Promise.resolve({ id: templateId, name: templateName });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:update', '--templatename', templateName, '--folderid', '0llxx000000000zCAA'])
    .it('runs analytics:template::update  --templatename myTemplate --folderid 0llxx000000000zCAA', ctx => {
      expect(ctx.stdout).to.contain(
        messages.getMessage('updateSuccess', [templateName, templateId, '0llxx000000000zCAA'])
      );
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        return Promise.resolve({ folders: [], templates: [] });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:update', '--templatename', templateName])
    .it('runs analytics:template::update  --templatename myTemplate', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('errorNoFolderFound', [templateName]));
    });
});
