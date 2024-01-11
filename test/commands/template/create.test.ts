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
import { AnyJson, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import Create from '../../../src/commands/analytics/template/create.js';
import { getStdout, stubDefaultOrg } from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');
const templateId = '0Nkxx000000000zCAA';
const folderId = '00lxx000000000zCAA';

describe('analytics:template:create', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --folderid ${folderId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    };

    await Create.run(['--folderid', folderId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('createSuccess', [templateId]));
    expect(requestBody, 'requestBody').to.deep.equal({ folderSource: { id: folderId } });
  });

  it(`runs: -f ${folderId} --label testlabel`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    };

    await Create.run(['-f', folderId, '--label', 'testlabel']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('createSuccess', [templateId]));
    expect(requestBody, 'requestBody').to.deep.equal({ folderSource: { id: folderId }, label: 'testlabel' });
  });

  it(`runs: -f ${folderId} --description "test description"`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    };

    await Create.run(['-f', folderId, '--description', 'test description']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('createSuccess', [templateId]));
    expect(requestBody, 'requestBody').to.deep.equal({
      folderSource: { id: folderId },
      description: 'test description',
    });
  });

  it(`runs: -f ${folderId} --label testlabel --description "test description"`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    };

    await Create.run(['-f', folderId, '--label', 'testlabel', '--description', 'test description']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('createSuccess', [templateId]));
    expect(requestBody, 'requestBody').to.deep.equal({
      folderSource: { id: folderId },
      label: 'testlabel',
      description: 'test description',
    });
  });

  it(`runs: -f ${folderId} -r "05vxx0000004CAeAAM, 05vxx0000004CAeAAM"`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    };

    await Create.run(['-f', folderId, '-r', '05vxx0000004CAeAAM, 05vxx0000004CAeAAM']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('createSuccess', [templateId]));
    expect(requestBody, 'requestBody').to.deep.equal({
      folderSource: { id: folderId },
      recipeIds: ['05vxx0000004CAeAAM', '05vxx0000004CAeAAM'],
    });
  });

  it(`runs: -f ${folderId} -d "1dtxxx000000001, 1dtxxx000000002" --apiversion 59.0`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    };

    await Create.run(['-f', folderId, '-d', '1dtxxx000000001, 1dtxxx000000002', '--apiversion', '59.0']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('createSuccess', [templateId]));
    expect(requestBody, 'requestBody').to.deep.equal({
      folderSource: { id: folderId },
      dataTransformIds: ['1dtxxx000000001', '1dtxxx000000002'],
    });
  });

  it(`runs: -f ${folderId} -r "05vxx0000004CAeAAM, 05vxx0000004CAeAAM" -d "1dtxxx000000001, 1dtxxx000000002" --apiversion 59.0`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: templateId });
      }
      return Promise.reject();
    };

    await Create.run([
      '-f',
      folderId,
      '-r',
      '05vxx0000004CAeAAM, 05vxx0000004CAeAAM',
      '-d',
      '1dtxxx000000001, 1dtxxx000000002',
      '--apiversion',
      '59.0',
    ]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('createSuccess', [templateId]));
    expect(requestBody, 'requestBody').to.deep.equal({
      folderSource: { id: folderId },
      recipeIds: ['05vxx0000004CAeAAM', '05vxx0000004CAeAAM'],
      dataTransformIds: ['1dtxxx000000001', '1dtxxx000000002'],
    });
  });
});
