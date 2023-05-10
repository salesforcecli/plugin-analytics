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

describe('analytics:template:create', () => {
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
      if (request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:create', '--folderid', '00lxx000000000zCAA'])
    .it('runs analytics:app:create --folderid 00lxx000000000zCAA', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createSuccess', [templateId]));
      expect(requestBody, 'requestBody').to.deep.equal({ folderSource: { id: '00lxx000000000zCAA' } });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:create', '-f', '00lxx000000000zCAA', '--label', 'testlabel'])
    .it('runs analytics:app:create -f 00lxx000000000zCAA --label testlabel', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createSuccess', [templateId]));
      expect(requestBody, 'requestBody').to.deep.equal({
        folderSource: { id: '00lxx000000000zCAA' },
        label: 'testlabel'
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:create', '-f', '00lxx000000000zCAA', '--description', 'test description'])
    .it('runs analytics:app:create -f 00lxx000000000zCAA --description "test description"', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createSuccess', [templateId]));
      expect(requestBody, 'requestBody').to.deep.equal({
        folderSource: { id: '00lxx000000000zCAA' },
        description: 'test description'
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command([
      'analytics:template:create',
      '-f',
      '00lxx000000000zCAA',
      '-l',
      'testlabel',
      '--description',
      'test description'
    ])
    .it('runs analytics:app:create -f 00lxx000000000zCAA -l testlabel --description "test description"', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createSuccess', [templateId]));
      expect(requestBody, 'requestBody').to.deep.equal({
        folderSource: { id: '00lxx000000000zCAA' },
        label: 'testlabel',
        description: 'test description'
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command([
      'analytics:template:create',
      '--folderid',
      '00lxx000000000zCAA',
      '-r',
      '05vxx0000004CAeAAM, 05vxx0000004CAeAAM'
    ])
    .it(
      'runs analytics:template:create --folderid 00lxx000000000zCAA, -r "05vxx0000004CAeAAM, 05vxx0000004CAeAAM"',
      ctx => {
        expect(ctx.stdout).to.contain(messages.getMessage('createSuccess', [templateId]));
        expect(requestBody, 'requestBody').to.deep.equal({
          folderSource: { id: '00lxx000000000zCAA' },
          recipeIds: ['05vxx0000004CAeAAM', '05vxx0000004CAeAAM']
        });
      }
    );

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command([
      'analytics:template:create',
      '--folderid',
      '00lxx000000000zCAA',
      '-d',
      '1dtxxx000000001, 1dtxxx000000002'
    ])
    .it('runs analytics:template:create --folderid 00lxx000000000zCAA, -d "1dtxxx000000001, 1dtxxx000000002"', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createSuccess', [templateId]));
      expect(requestBody, 'requestBody').to.deep.equal({
        folderSource: { id: '00lxx000000000zCAA' },
        datatransformIds: ['1dtxxx000000001', '1dtxxx000000002']
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command([
      'analytics:template:create',
      '--folderid',
      '00lxx000000000zCAA',
      '-r',
      '05vxx0000004CAeAAM, 05vxx0000004CAeAAM',
      '-d',
      '1dtxxx000000001, 1dtxxx000000002'
    ])
    .it(
      'runs analytics:template:create --folderid 00lxx000000000zCAA, -r "05vxx0000004CAeAAM, 05vxx0000004CAeAAM", -d "1dtxxx000000001, 1dtxxx000000002"',
      ctx => {
        expect(ctx.stdout).to.contain(messages.getMessage('createSuccess', [templateId]));
        expect(requestBody, 'requestBody').to.deep.equal({
          folderSource: { id: '00lxx000000000zCAA' },
          recipeIds: ['05vxx0000004CAeAAM', '05vxx0000004CAeAAM'],
          datatransformIds: ['1dtxxx000000001', '1dtxxx000000002']
        });
      }
    );
});
