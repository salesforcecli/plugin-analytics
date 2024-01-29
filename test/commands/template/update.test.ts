/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { AnyJson, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import { expect } from 'chai';
import Update from '../../../src/commands/analytics/template/update.js';
import { getStdout, stubDefaultOrg } from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');
const templateId = '0Nkxx000000000zCAA';
const templateName = 'myTemplate';
const folderId = '00lxx000000000zCAA';

describe('analytics:template:update', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --templateId ${templateId} (not found)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        return Promise.resolve({ folders: [], templates: [] });
      }
      if (request.method === 'POST') {
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Update.run(['--templateid', templateId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('errorNoFolderFound', [templateId]));
  });

  it(`runs: --templateId ${templateId} --folderid ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        return Promise.resolve({ folders: [], templates: [] });
      }
      if (request.method === 'POST') {
        return Promise.resolve({ id: folderId });
      }
      if (request.method === 'PUT') {
        return Promise.resolve({ id: templateId, name: templateName });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Update.run(['--templateid', templateId, '--folderid', folderId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('updateSuccess', [templateName, templateId, folderId]));
  });

  it(`runs: --folderid ${folderId} --templateId ${templateId} --assetversion 50 --apiversion 54.0`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'PUT') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: templateId, name: templateName, assetVersion: 50 });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Update.run([
      '--folderid',
      folderId,
      '--templateid',
      templateId,
      '--assetversion',
      '50',
      '--apiversion',
      '54.0',
    ]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('updateSuccess', [templateName, templateId, folderId]));
    expect(requestBody, 'requestBody').to.deep.equal({
      folderSource: { id: folderId },
      assetVersion: 50,
    });
  });

  it(`runs: --templatename ${templateName} --folderid ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'PUT') {
        return Promise.resolve({ id: templateId, name: templateName });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Update.run(['--templatename', templateName, '--folderid', folderId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('updateSuccess', [templateName, templateId, folderId]));
  });

  it(`runs: --templatename ${templateName}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        return Promise.resolve({ folders: [], templates: [] });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Update.run(['--templatename', templateName]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('errorNoFolderFound', [templateName]));
  });

  it(`runs: --folderid ${folderId} --templateId ${templateId} -r "05vxx0000004CAeAAM, 05vxx0000004CAeAAM" --apiversion 55.0`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'PUT') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: templateId, name: templateName, assetVersion: 50 });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Update.run([
      '--folderid',
      folderId,
      '--templateid',
      templateId,
      '-r',
      '05vxx0000004CAeAAM, 05vxx0000004CAeAAM',
      '--apiversion',
      '55.0',
    ]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('updateSuccess', [templateName, templateId, folderId]));
    expect(requestBody, 'requestBody').to.deep.equal({
      folderSource: { id: folderId },
      recipeIds: ['05vxx0000004CAeAAM', '05vxx0000004CAeAAM'],
    });
  });

  it(`runs: --folderid ${folderId} --templateId ${templateId} -d "1dtxxx000000001, 1dtxxx000000002" --apiversion 59.0`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'PUT') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: templateId, name: templateName, assetVersion: 50 });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Update.run([
      '--folderid',
      folderId,
      '--templateid',
      templateId,
      '-d',
      '1dtxxx000000001, 1dtxxx000000002',
      '--apiversion',
      '59.0',
    ]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('updateSuccess', [templateName, templateId, folderId]));
    expect(requestBody, 'requestBody').to.deep.equal({
      folderSource: { id: folderId },
      dataTransformIds: ['1dtxxx000000001', '1dtxxx000000002'],
    });
  });

  it(`runs: --folderid ${folderId} --templateId ${templateId} -r "05vxx0000004CAeAAM, 05vxx0000004CAeAAM" -d "1dtxxx000000001, 1dtxxx000000002" --apiversion 59.0`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'PUT') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: templateId, name: templateName, assetVersion: 50 });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Update.run([
      '--folderid',
      folderId,
      '--templateid',
      templateId,
      '-r',
      '05vxx0000004CAeAAM, 05vxx0000004CAeAAM',
      '-d',
      '1dtxxx000000001, 1dtxxx000000002',
      '--apiversion',
      '59.0',
    ]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('updateSuccess', [templateName, templateId, folderId]));
    expect(requestBody, 'requestBody').to.deep.equal({
      folderSource: { id: folderId },
      recipeIds: ['05vxx0000004CAeAAM', '05vxx0000004CAeAAM'],
      dataTransformIds: ['1dtxxx000000001', '1dtxxx000000002'],
    });
  });
});
