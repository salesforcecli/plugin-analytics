/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import { ensureJsonMap, ensureString } from '@salesforce/ts-types';
import Delete from '../../../src/commands/analytics/template/delete.js';
import { getStdout, stubDefaultOrg } from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');
const templateId = '0Nkxx000000000zCAA';
const appId = '0llxx000000000zCAA';
const appLabel = 'theapp';

describe('analytics:template:delete', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  let folderGets: number;
  let templateDeletes: number;
  let folderDeletes: number;
  let folderPuts: number;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    folderGets = 0;
    templateDeletes = 0;
    folderDeletes = 0;
    folderPuts = 0;
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: -t ${templateId} --noprompt`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.includes('/wave/templates')) {
        return Promise.resolve({ templates: [templateId] });
      }
      if (request.method === 'GET' && url.includes('/wave/folders')) {
        folderGets++;
        return Promise.resolve({ folders: [] });
      }
      if (request.method === 'DELETE' && url.includes('/wave/templates/')) {
        templateDeletes++;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Delete.run(['-t', templateId, '--noprompt']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('deleteTemplateSuccess', [templateId]));
    expect(templateDeletes, '# of template DELETEs').to.equal(1);
    expect(folderGets, '# of folder GETs').to.equal(0);
    expect(folderDeletes, '# of folder DELETEs').to.equal(0);
    expect(folderPuts, '# of folder PUTs').to.equal(0);
  });

  it(`runs: -t ${templateId} --noprompt --forcedelete (no linked folders)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.includes('/wave/templates')) {
        return Promise.resolve({ templates: [templateId] });
      }
      if (request.method === 'GET' && url.includes('/wave/folders')) {
        folderGets++;
        return Promise.resolve({ folders: [] });
      }
      if (request.method === 'DELETE' && url.includes('/wave/templates/')) {
        templateDeletes++;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Delete.run(['-t', templateId, '--noprompt', '--forcedelete']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('deleteTemplateSuccess', [templateId]));
    expect(folderGets, '# of folder GETs').to.equal(1);
    expect(templateDeletes, '# of template DELETEs').to.equal(1);
  });

  it(`runs: -t ${templateId} --noprompt --forcedelete`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.includes('/wave/templates')) {
        return Promise.resolve({ templates: [templateId] });
      }
      if (request.method === 'GET' && url.includes('/wave/folders')) {
        folderGets++;
        return Promise.resolve({
          id: appId,
          folders: [{ id: appId, templateSourceId: templateId, label: appLabel }],
        });
      }
      if (request.method === 'DELETE' && url.includes('/wave/folders/')) {
        folderDeletes++;
        return Promise.resolve({ id: appId });
      }
      if (request.method === 'DELETE' && url.includes('/wave/templates/')) {
        templateDeletes++;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Delete.run(['-t', templateId, '--noprompt', '--forcedelete']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('deleteAppSuccess', [appLabel, appId]));
    expect(folderGets, '# of folder GETs').to.equal(1);
    expect(folderDeletes, '# of folder DELETEs').to.equal(1);
    expect(templateDeletes, '# of template DELETEs').to.equal(1);
    expect(folderPuts, '# of folder PUTs').to.equal(0);
  });

  it(`runs: --noprompt --decouple --templateid ${templateId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.includes('/wave/templates')) {
        return Promise.resolve({ templates: [templateId] });
      }
      if (request.method === 'GET' && url.includes('/wave/folders')) {
        folderGets++;
        return Promise.resolve({
          id: appId,
          folders: [{ id: appId, templateSourceId: templateId, label: appLabel }],
        });
      }
      if (request.method === 'PUT' && url.includes('/wave/folders/')) {
        folderPuts++;
        return Promise.resolve({ id: appId });
      }
      if (request.method === 'DELETE' && url.includes('/wave/templates/')) {
        templateDeletes++;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Delete.run(['--noprompt', '--decouple', '--templateid', templateId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('decoupleAppSuccess', [appLabel, appId]));
    expect(folderGets, '# of folder GETs').to.equal(1);
    // the puts are the decouple() calls
    expect(folderPuts, '# of folder PUTs').to.equal(1);
    expect(templateDeletes, '# of template DELETEs').to.equal(1);
    expect(folderDeletes, '# of folder DELETEs').to.equal(0);
  });
});
