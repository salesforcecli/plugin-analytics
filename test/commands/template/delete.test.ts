/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { core } from '@salesforce/command';
import { expect, test } from '@salesforce/command/lib/test';
import { ensureJsonMap, ensureString } from '@salesforce/ts-types';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'template');
const templateId = '0Nkxx000000000zCAA';
const appId = '0llxx000000000zCAA';
const appLabel = 'theapp';

describe('analytics:template:delete', () => {
  let folderGets: number;
  let templateDeletes: number;
  let folderDeletes: number;
  let folderPuts: number;
  beforeEach(() => {
    folderGets = 0;
    templateDeletes = 0;
    folderDeletes = 0;
    folderPuts = 0;
  });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.indexOf('/wave/templates') >= 0) {
        return Promise.resolve({ templates: [templateId] });
      }
      if (request.method === 'GET' && url.indexOf('/wave/folders') >= 0) {
        folderGets++;
        return Promise.resolve({ folders: [] });
      }
      if (request.method === 'DELETE' && url.indexOf('/wave/templates/') >= 0) {
        templateDeletes++;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:delete', '--noprompt', '-t', templateId])
    .it('runs analytics:template:delete -t 0Nkxx000000000zCAA --noprompt', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('deleteTemplateSuccess', [templateId]));
      expect(templateDeletes, '# of template DELETEs').to.equal(1);
      expect(folderGets, '# of folder GETs').to.equal(0);
      expect(folderDeletes, '# of folder DELETEs').to.equal(0);
      expect(folderPuts, '# of folder PUTs').to.equal(0);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.indexOf('/wave/templates') >= 0) {
        return Promise.resolve({ templates: [templateId] });
      }
      if (request.method === 'GET' && url.indexOf('/wave/folders') >= 0) {
        folderGets++;
        return Promise.resolve({ folders: [] });
      }
      if (request.method === 'DELETE' && url.indexOf('/wave/templates/') >= 0) {
        templateDeletes++;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:delete', '--noprompt', '--forcedelete', '-t', templateId])
    .it('runs analytics:template:delete -t 0Nkxx000000000zCAA --noprompt --forcedelete (no linked folders)', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('deleteTemplateSuccess', [templateId]));
      expect(folderGets, '# of folder GETs').to.equal(1);
      expect(templateDeletes, '# of template DELETEs').to.equal(1);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.indexOf('/wave/templates') >= 0) {
        return Promise.resolve({ templates: [templateId] });
      }
      if (request.method === 'GET' && url.indexOf('/wave/folders') >= 0) {
        folderGets++;
        return Promise.resolve({
          id: '0llxx000000000zCAA',
          folders: [{ id: appId, templateSourceId: templateId, label: appLabel }]
        });
      }
      if (request.method === 'DELETE' && url.indexOf('/wave/folders/') >= 0) {
        folderDeletes++;
        return Promise.resolve({ id: '0llxx000000000zCAA' });
      }
      if (request.method === 'DELETE' && url.indexOf('/wave/templates/') >= 0) {
        templateDeletes++;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:delete', '--noprompt', '--forcedelete', '--templateid', templateId])
    .it('runs analytics:template:delete --templateid 0Nkxx000000000zCAA --noprompt --forcedelete', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('deleteAppSuccess', [appLabel, appId]));
      expect(folderGets, '# of folder GETs').to.equal(1);
      expect(folderDeletes, '# of folder DELETEs').to.equal(1);
      expect(templateDeletes, '# of template DELETEs').to.equal(1);
      expect(folderPuts, '# of folder PUTs').to.equal(0);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.indexOf('/wave/templates') >= 0) {
        return Promise.resolve({ templates: [templateId] });
      }
      if (request.method === 'GET' && url.indexOf('/wave/folders') >= 0) {
        folderGets++;
        return Promise.resolve({
          id: '0llxx000000000zCAA',
          folders: [{ id: appId, templateSourceId: templateId, name: appLabel }]
        });
      }
      if (request.method === 'PUT' && url.indexOf('/wave/folders/') >= 0) {
        folderPuts++;
        return Promise.resolve({ id: '0llxx000000000zCAA' });
      }
      if (request.method === 'DELETE' && url.indexOf('/wave/templates/') >= 0) {
        templateDeletes++;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:template:delete', '--noprompt', '--decouple', '--templateid', templateId])
    .it('runs analytics:template:delete --templateid 0Nkxx000000000zCAA --noprompt --decouple', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('decoupleAppSuccess', [appLabel, appId]));
      expect(folderGets, '# of folder GETs').to.equal(1);
      // the puts are the decouple() calls
      expect(folderPuts, '# of folder PUTs').to.equal(1);
      expect(templateDeletes, '# of template DELETEs').to.equal(1);
      expect(folderDeletes, '# of folder DELETEs').to.equal(0);
    });
});
