/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages, SfError, StreamingClient } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import { AnyJson, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import { stubMethod } from '@salesforce/ts-sinon';
import Create from '../../../src/commands/analytics/app/create.js';
import { getJsonOutput, getStdout, getStyledHeaders, stubDefaultOrg } from '../../testutils.js';
import { fs } from '../../../src/lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

const appId = '0llxx000000000zCAA';
const testTemplateJson = {
  id: '0Nkxx000000000zCAA',
  summary: '',
  label: 'Test Template',
  name: 'TestTemplate',
};
const sustainabilityTemplateJson = { id: '0Nkxx000000000zCAB', name: 'Sustainability', label: 'Sustainability' };

describe('analytics:app:create', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --templateid ${testTemplateJson.id} --async`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'GET') {
        // call for the template by id, it should return the one template
        return Promise.resolve(testTemplateJson);
      }
      if (ensureString(request.method) === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Create.run(['--templateid', testTemplateJson.id, '--async']);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(
      messages.getMessage('startAppCreation', [appId])
    );
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
    expect(requestBody, 'requestBody').to.include({
      templateSourceId: testTemplateJson.id,
      label: testTemplateJson.label,
      name: testTemplateJson.name,
    });
  });

  // make sure --async --json returns the the app id
  it(`runs: --templateid ${testTemplateJson.id} --async --json`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'GET') {
        // call for the template by id, it should return the one template
        return Promise.resolve(testTemplateJson);
      }
      if (ensureString(request.method) === 'POST') {
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Create.run(['--templateid', testTemplateJson.id, '--async', '--json']);
    expect(getJsonOutput(sfCommandStubs), 'result').to.deep.include({
      result: {
        id: appId,
      },
    });
  });

  it(`runs: -t ${testTemplateJson.id} -n customname --wait 0`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'GET') {
        // call for the template by id, it should return the one template
        return Promise.resolve(testTemplateJson);
      }
      if (ensureString(request.method) === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    // --wait=0 should be the same as --async so this should return right away
    await Create.run(['-t', testTemplateJson.id, '-n', 'customname', '--wait', '0']);
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
    expect(requestBody, 'requestBody').to.include({
      // request body should have values from the template GET
      templateSourceId: testTemplateJson.id,
      // but name and label should be from arg
      label: 'customname',
      name: 'customname',
    });
  });

  it('runs: --templatename Sustainability --async', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'GET') {
        // call for all templates
        return Promise.resolve({
          templates: [testTemplateJson, sustainabilityTemplateJson],
        });
      }
      if (ensureString(request.method) === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Create.run(['--templatename', 'Sustainability', '--async']);
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
    // request body should have values from the templates GET
    expect(requestBody, 'requestBody').to.include({
      templateSourceId: sustainabilityTemplateJson.id,
      label: sustainabilityTemplateJson.label,
      name: sustainabilityTemplateJson.name,
    });
  });

  it('runs: --templatename Sustainability --appname customname --appdescription customdesc --async', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'GET') {
        // call for all templates
        return Promise.resolve({
          templates: [testTemplateJson, sustainabilityTemplateJson],
        });
      }
      if (ensureString(request.method) === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };

    await Create.run([
      '--templatename',
      'Sustainability',
      '--appname',
      'customname',
      '--appdescription',
      'customdesc',
      '--async',
    ]);
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
    expect(requestBody, 'requestBody').to.include({
      // this should come from the template GET
      templateSourceId: sustainabilityTemplateJson.id,
      // these should come from the args
      label: 'customname',
      name: 'customname',
      description: 'customdesc',
    });
  });

  it('runs: --definitionfile config/foo.json --async', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'POST') {
        requestBody = JSON.parse(request.body as string) as AnyJson;
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };
    stubMethod($$.SANDBOX, fs, 'readFile').callsFake(() =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png',
          label: testTemplateJson.label,
          name: testTemplateJson.name,
        })
      )
    );

    await Create.run(['--definitionfile', 'config/foo.json', '--async']);
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
    expect(requestBody, 'requestBody').to.include({
      // request body should have fields from the readFile()
      templateSourceId: testTemplateJson.id,
      assetIcon: '16.png',
      label: testTemplateJson.label,
      name: testTemplateJson.name,
    });
  });

  it('runs: --definitionfile config/foo.json -n customname -a', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'POST') {
        requestBody = JSON.parse(request.body as string) as AnyJson;
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };
    stubMethod($$.SANDBOX, fs, 'readFile').callsFake(() =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png',
          // leave off name and label so it should use the name from the cli arg
        })
      )
    );

    await Create.run(['--definitionfile', 'config/foo.json', '-n', 'customname', '-a']);
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
    expect(requestBody, 'requestBody').to.include({
      // request body should have fields from the readFile()
      templateSourceId: testTemplateJson.id,
      assetIcon: '16.png',
      // but name and label should come from cli arg
      label: 'customname',
      name: 'customname',
    });
  });

  it('run: -f config/emptyapp.json', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };
    stubMethod($$.SANDBOX, fs, 'readFile').callsFake(() =>
      Promise.resolve(
        JSON.stringify({
          assetIcon: '16.png',
          name: 'emptyapp',
          label: 'Empty App',
          // leave off templateSourceId to make sure this finishes w/o the --async
        })
      )
    );
    stubMethod($$.SANDBOX, StreamingClient, 'create').callsFake(() =>
      Promise.reject(new SfError('StreamingClient.create() should not be called'))
    );

    await Create.run(['-f', 'config/emptyapp.json']);
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
    expect(requestBody, 'requestBody').to.include({
      // request body should have fields from the readFile()
      assetIcon: '16.png',
      name: 'emptyapp',
      label: 'Empty App',
    });
    // and it shouldn't have a template id listed
    expect(requestBody, 'requestBody').to.not.have.key('templateSourceId');
  });

  it('runs: --definitionfile config/foo.json', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'POST') {
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };
    stubMethod($$.SANDBOX, StreamingClient, 'create').callsFake(async (options?: StreamingClient.Options) => ({
      init: async () => {},
      handshake: async () => StreamingClient.ConnectionState.CONNECTED,
      replay: async () => {},
      subscribe: async (streamInit?: () => Promise<void>) => {
        // the streamInit is what creates the app and sets the app id
        if (streamInit) {
          await streamInit();
        }
        options?.streamProcessor({
          payload: {
            EventType: 'Application',
            Status: 'Success',
            ItemLabel: 'foo',
            FolderId: appId,
            Message: 'Success',
          },
          event: { replayId: 20 },
        });
      },
    }));
    stubMethod($$.SANDBOX, fs, 'readFile').callsFake(() =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png',
        })
      )
    );

    await Create.run(['--definitionfile', 'config/foo.json']);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(
      messages.getMessage('startAppCreation', [appId])
    );
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('finishAppCreation', ['foo']));
  });

  // verify that we get the appId and streaming events when doing --json
  it('runs: --definitionfile config/foo.json --json', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'POST') {
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };
    stubMethod($$.SANDBOX, StreamingClient, 'create').callsFake(async (options?: StreamingClient.Options) => ({
      handshake: async () => StreamingClient.ConnectionState.CONNECTED,
      replay: async () => -1,
      subscribe: async (streamInit?: () => Promise<void>) => {
        // the streamInit is what creates the app and sets the app id
        if (streamInit) {
          await streamInit();
        }
        options?.streamProcessor({
          payload: {
            EventType: 'Application',
            Status: 'Success',
            ItemLabel: 'foo',
            FolderId: appId,
            Message: 'Success',
          },
          event: { replayId: 20 },
        });
      },
    }));
    stubMethod($$.SANDBOX, fs, 'readFile').callsFake(() =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png',
        })
      )
    );

    await Create.run(['--definitionfile', 'config/foo.json', '--json']);
    expect(getJsonOutput(sfCommandStubs), 'result').to.deep.include({
      result: {
        id: appId,
        events: [
          {
            EventType: 'Application',
            Index: 0,
            ItemLabel: 'foo',
            Message: 'Success',
            Status: 'Success',
            Total: 0,
          },
        ],
      },
    });
  });

  it('runs: --definitionfile config/foo.json (with failure)', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'POST') {
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };
    stubMethod($$.SANDBOX, StreamingClient, 'create').callsFake(async (options?: StreamingClient.Options) => ({
      handshake: async () => StreamingClient.ConnectionState.CONNECTED,
      replay: async () => -1,
      subscribe: async (streamInit?: () => Promise<void>) => {
        // the streamInit is what creates the app and sets the app id
        if (streamInit) {
          await streamInit();
        }
        options?.streamProcessor({
          payload: {
            EventType: 'Application',
            Status: 'Failed',
            ItemLabel: 'foo',
            FolderId: 'test',
            Message: 'failed',
          },
          event: { replayId: 20 },
        });
      },
    }));
    stubMethod($$.SANDBOX, fs, 'readFile').callsFake(() =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png',
        })
      )
    );

    try {
      await Create.run(['--definitionfile', 'config/foo.json']);
    } catch (error) {
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain(
        messages.getMessage('finishAppCreationFailure', ['failed'])
      );
      return;
    }
    expect.fail('Expecpted an error');
  });

  // verify --json on failure returns the app id and the events
  it('runs: --definitionfile config/foo.json --json (with failure)', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.method) === 'POST') {
        return Promise.resolve({ id: appId });
      }
      return Promise.reject(new Error('Invalid request: ' + JSON.stringify(request)));
    };
    stubMethod($$.SANDBOX, StreamingClient, 'create').callsFake(async (options?: StreamingClient.Options) => ({
      handshake: async () => StreamingClient.ConnectionState.CONNECTED,
      replay: async () => -1,
      subscribe: async (streamInit?: () => Promise<void>) => {
        // the streamInit is what creates the app and sets the app id
        if (streamInit) {
          await streamInit();
        }
        options?.streamProcessor({
          payload: {
            EventType: 'Application',
            Status: 'Failed',
            ItemLabel: 'foo',
            FolderId: 'test',
            Message: 'failed',
          },
          event: { replayId: 20 },
        });
      },
    }));
    stubMethod($$.SANDBOX, fs, 'readFile').callsFake(() =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png',
        })
      )
    );

    try {
      await Create.run(['--definitionfile', 'config/foo.json', '--json']);
    } catch (error) {
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain(
        messages.getMessage('finishAppCreationFailure', ['failed'])
      );
      const json = getJsonOutput(sfCommandStubs);
      expect(json, 'json results').to.deep.include({
        status: 1,
        exitCode: 1,
        message: messages.getMessage('finishAppCreationFailure', ['failed']),
        data: {
          id: appId,
          events: [
            {
              EventType: 'Application',
              Index: 0,
              ItemLabel: 'foo',
              Message: 'failed',
              Status: 'Failed',
              Total: 0,
            },
          ],
        },
      });
      return;
    }
    expect.fail('Expecpted an error');
  });
});
