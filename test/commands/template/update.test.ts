/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';
import { AnyJson, ensureJsonMap, ensureString } from '@salesforce/ts-types';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'template');
const templateId = '0Nkxx000000000zCAA';
const templateName = 'myTemplate';

describe('analytics:template:update', () => {
  let requestBody: AnyJson | undefined;
  function saveOffRequestBody(json: string | undefined) {
    requestBody = undefined;
    try {
      requestBody = json && (JSON.parse(json) as AnyJson);
    } catch (e) {
      expect.fail('Error parsing request body: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  beforeEach(() => {
    requestBody = undefined;
  });

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
        return Promise.resolve({ id: '00lxx000000000zCAA' });
      }
      if (request.method === 'PUT') {
        return Promise.resolve({ id: templateId, name: templateName });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:update', '--templateid', '0Nkxx000000000zCAA', '--folderid', '00lxx000000000zCAA'])
    .it('runs analytics:template:update  --templateid 0Nkxx000000000zCAA --folderid 00lxx000000000zCAA', ctx => {
      expect(ctx.stdout).to.contain(
        messages.getMessage('updateSuccess', [templateName, templateId, '00lxx000000000zCAA'])
      );
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'PUT') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ id: templateId, name: templateName, assetVersion: 50 });
      }
      return Promise.reject();
    })
    .stdout()
    .command([
      'analytics:template:update',
      '--folderid',
      '00lxx000000000zCAA',
      '--templateid',
      '0Nkxx000000000zCAA',
      '--assetversion',
      '50',
      '--apiversion',
      '54.0'
    ])
    .it(
      'runs analytics:template:update --folderid 00lxx000000000zCAA --templateid 0Nkxx000000000zCAA --assetversion 50 --apiversion 54.0',
      ctx => {
        expect(ctx.stdout).to.contain(
          messages.getMessage('updateSuccess', [templateName, templateId, '00lxx000000000zCAA'])
        );
        expect(requestBody, 'requestBody').to.deep.equal({
          folderSource: { id: '00lxx000000000zCAA' },
          assetVersion: 50
        });
      }
    );

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        return Promise.resolve({ folders: [], templates: [] });
      }
      if (request.method === 'POST') {
        return Promise.resolve({ id: '00lxx000000000zCAA' });
      }
      if (request.method === 'PUT') {
        return Promise.resolve({ id: templateId, name: templateName });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:update', '--templatename', templateName, '--folderid', '00lxx000000000zCAA'])
    .it('runs analytics:template::update  --templatename myTemplate --folderid 00lxx000000000zCAA', ctx => {
      expect(ctx.stdout).to.contain(
        messages.getMessage('updateSuccess', [templateName, templateId, '00lxx000000000zCAA'])
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

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'PUT') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ name: templateName, id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command([
      'analytics:template:update',
      '--folderid',
      '00lxx000000000zCAA',
      '--templateid',
      '0Nkxx000000000zCAA',
      '-r',
      '05vxx0000004CAeAAM, 05vxx0000004CAeAAM'
    ])
    .it(
      'runs analytics:template:update --templateid 0Nkxx000000000zCAA --folderid 00lxx000000000zCAA  -r "05vxx0000004CAeAAM, 05vxx0000004CAeAAM"',
      ctx => {
        expect(ctx.stdout).to.contain(
          messages.getMessage('updateSuccess', [templateName, templateId, '00lxx000000000zCAA'])
        );
        expect(requestBody, 'requestBody').to.deep.equal({
          folderSource: { id: '00lxx000000000zCAA' }
        });
      }
    );
});
