/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promises as fs } from 'fs';
import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';
import { AnyJson, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import { StreamingClient } from '@salesforce/core';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'app');
const appId = '0llxx000000000zCAA';
const testTemplateJson = {
  id: '0Nkxx000000000zCAA',
  description: '',
  label: 'Test Template',
  name: 'TestTemplate'
};
const sustainabilityTemplateJson = { id: '0Nkxx000000000zCAB', name: 'Sustainability', label: 'Sustainability' };

describe('analytics:app:create', () => {
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
        // call for the template by id, it should return the one template
        return Promise.resolve(testTemplateJson);
      }
      if (request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:app:create', '--templateid', testTemplateJson.id, '--async'])
    .it(`runs analytics:app:create --templateid ${testTemplateJson.id} --async`, ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
      // request body should have values from the template GET
      expect(requestBody, 'requestBody').to.not.be.undefined;
      expect(requestBody, 'requestBody').to.include({
        templateSourceId: testTemplateJson.id,
        label: testTemplateJson.label,
        name: testTemplateJson.name
      });
    });

  // make sure --async --json returns the the app id
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        // call for the template by id, it should return the one template
        return Promise.resolve(testTemplateJson);
      }
      if (request.method === 'POST') {
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:app:create', '--templateid', testTemplateJson.id, '--async', '--json'])
    .it(`runs analytics:app:create --templateid ${testTemplateJson.id} --async --json`, ctx => {
      expect(ctx.stdout).to.not.be.undefined.and.not.be.null.and.not.equal('');
      const results = JSON.parse(ctx.stdout) as unknown;
      expect(results, 'result').to.deep.include({
        status: 0,
        result: {
          id: appId
        }
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        // call for the template by id, it should return the one template
        return Promise.resolve(testTemplateJson);
      }
      if (request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stdout()
    // --wait=0 should be the same as --async so this should return right away
    .command(['analytics:app:create', '-t', testTemplateJson.id, '-n', 'customname', '--wait=0'])
    .it(`runs analytics:app:create -t ${testTemplateJson.id} -n customname --wait=0`, ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
      expect(requestBody, 'requestBody').to.not.be.undefined;
      expect(requestBody, 'requestBody').to.include({
        // request body should have values from the template GET
        templateSourceId: testTemplateJson.id,
        // but name and label should be from arg
        label: 'customname',
        name: 'customname'
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        // call for all templates
        return Promise.resolve({
          templates: [testTemplateJson, sustainabilityTemplateJson]
        });
      }
      if (request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:app:create', '--templatename', 'Sustainability', '--async'])
    .it('runs analytics:app:create --templatename Sustainability --async', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
      // request body should have values from the templates GET
      expect(requestBody, 'requestBody').to.not.be.undefined;
      expect(requestBody, 'requestBody').to.include({
        templateSourceId: sustainabilityTemplateJson.id,
        label: sustainabilityTemplateJson.label,
        name: sustainabilityTemplateJson.name
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        // call for all templates
        return Promise.resolve({
          templates: [testTemplateJson, sustainabilityTemplateJson]
        });
      }
      if (request.method === 'POST') {
        saveOffRequestBody(request.body as string);
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stdout()
    .command(['analytics:app:create', '--templatename', 'Sustainability', '--appname', 'customname', '--async'])
    .it('runs analytics:app:create --templatename Sustainability --appname customname --async', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
      expect(requestBody, 'requestBody').to.not.be.undefined;
      expect(requestBody, 'requestBody').to.include({
        // request body should have values from the templates GET
        templateSourceId: sustainabilityTemplateJson.id,
        // but name and label should come from the cli arg
        label: 'customname',
        name: 'customname'
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'GET') {
        // call for all templates
        return Promise.resolve({
          templates: [testTemplateJson, sustainabilityTemplateJson]
        });
      }
      if (request.method === 'POST') {
        saveOffRequestBody(request.body as string);
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stdout()
    .command([
      'analytics:app:create',
      '--templatename',
      'Sustainability',
      '--appname',
      'customname',
      '--appdescription',
      'customdesc',
      '--async'
    ])
    .it(
      'runs analytics:app:create --templatename Sustainability --appname customname --appdescription customdesc --async',
      ctx => {
        expect(ctx.stdout).to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
        expect(requestBody, 'requestBody').to.not.be.undefined;
        expect(requestBody, 'requestBody').to.include({
          // request body should have values from the templates GET
          templateSourceId: sustainabilityTemplateJson.id,
          // but name and label should come from the cli arg
          label: 'customname',
          name: 'customname',
          description: 'customdesc'
        });
      }
    );

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        saveOffRequestBody(request.body as string);
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stub(fs, 'readFile', () =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png',
          label: testTemplateJson.label,
          name: testTemplateJson.name
        })
      )
    )
    .stdout()
    .command(['analytics:app:create', '--definitionfile', 'config/foo.json', '--async'])
    .it('runs analytics:app:create --definitionfile config/foo.json --async', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
      expect(requestBody, 'requestBody').to.not.be.undefined;
      expect(requestBody, 'requestBody').to.include({
        // request body should have fields from the readFile()
        templateSourceId: testTemplateJson.id,
        assetIcon: '16.png',
        label: testTemplateJson.label,
        name: testTemplateJson.name
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        saveOffRequestBody(request.body as string);
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stub(fs, 'readFile', () =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png'
          // leave off name and label so it should use the name from the cli arg
        })
      )
    )
    .stdout()
    .command(['analytics:app:create', '-f', 'config/foo.json', '-n', 'customname', '-a'])
    .it('runs analytics:app:create -f config/foo.json -n customname -a', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
      expect(requestBody, 'requestBody').to.not.be.undefined;
      expect(requestBody, 'requestBody').to.include({
        // request body should have fields from the readFile()
        templateSourceId: testTemplateJson.id,
        assetIcon: '16.png',
        // but name and label should come from cli arg
        name: 'customname',
        label: 'customname'
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        saveOffRequestBody(request.body as string);
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stub(fs, 'readFile', () =>
      Promise.resolve(
        JSON.stringify({
          assetIcon: '16.png',
          name: 'emptyapp',
          label: 'Empty App'
          // leave off templateSourceId to make sure this finishes w/o the --async
        })
      )
    )
    .stdout()
    .command(['analytics:app:create', '-f', 'config/emptyapp.json'])
    .it('runs analytics:app:create -f config/emptyapp.json', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('createAppSuccessAsync', [appId]));
      expect(requestBody, 'requestBody').to.not.be.undefined;
      expect(requestBody, 'requestBody').to.include({
        // request body should have fields from the readFile()
        assetIcon: '16.png',
        name: 'emptyapp',
        label: 'Empty App'
      });
      // and it shouldn't have a template id listed
      expect(requestBody, 'requestBody').to.not.have.key('templateSourceId');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stub(core.StreamingClient, 'create', async (options?: StreamingClient.Options) => {
      return {
        handshake: async () => StreamingClient.ConnectionState.CONNECTED,
        replay: async () => -1,
        subscribe: async () =>
          options?.streamProcessor({
            payload: {
              EventType: 'Application',
              Status: 'Success',
              ItemLabel: 'foo',
              FolderId: 'test',
              Message: 'Success'
            },
            event: { replayId: 20 }
          })
      };
    })
    .stub(fs, 'readFile', () =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png'
        })
      )
    )
    .stdout()
    .command(['analytics:app:create', '--definitionfile', 'config/foo.json'])
    .it('runs analytics:app:create --definitionfile config/foo.json (with success message)', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('finishAppCreation', ['foo']));
    });

  // verify that we get the appId and streaming events when doing --json
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stub(core.StreamingClient, 'create', async (options?: StreamingClient.Options) => {
      return {
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
              FolderId: 'test',
              Message: 'Success'
            },
            event: { replayId: 20 }
          });
        }
      };
    })
    .stub(fs, 'readFile', () =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png'
        })
      )
    )
    .stdout()
    .command(['analytics:app:create', '--definitionfile', 'config/foo.json', '--json'])
    .it('runs analytics:app:create --definitionfile config/foo.json --json (with success message)', ctx => {
      expect(ctx.stdout).to.not.be.undefined.and.not.be.null.and.not.equal('');
      const results = JSON.parse(ctx.stdout) as unknown;
      expect(results, 'result').to.deep.include({
        status: 0,
        result: {
          id: appId,
          events: [
            {
              EventType: 'Application',
              Index: 0,
              ItemLabel: 'foo',
              Message: 'Success',
              Status: 'Success',
              Total: 0
            }
          ]
        }
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stub(core.StreamingClient, 'create', async (options?: StreamingClient.Options) => {
      return {
        handshake: async () => StreamingClient.ConnectionState.CONNECTED,
        replay: async () => -1,
        subscribe: async () =>
          options?.streamProcessor({
            payload: {
              EventType: 'Application',
              Status: 'Failed',
              ItemLabel: 'foo',
              FolderId: 'test',
              Message: 'failed'
            },
            event: { replayId: 20 }
          })
      };
    })
    .stub(fs, 'readFile', () =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png'
        })
      )
    )
    .stdout()
    .stderr()
    .command(['analytics:app:create', '--definitionfile', 'config/foo.json'])
    .it('runs analytics:app:create --definitionfile config/foo.json (with failure message)', ctx => {
      // this is in the list of events output
      expect(ctx.stdout).to.contain(messages.getMessage('finishAppCreationFailure', ['failed']));
      // and this is from the command failing
      expect(ctx.stderr).to.contain(messages.getMessage('finishAppCreationFailure', ['failed']));
    });

  // verify --json on failure returns the app id and the events
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (request.method === 'POST') {
        return Promise.resolve({ id: appId });
      }
      return Promise.reject();
    })
    .stub(core.StreamingClient, 'create', async (options?: StreamingClient.Options) => {
      return {
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
              Message: 'failed'
            },
            event: { replayId: 20 }
          });
        }
      };
    })
    .stub(fs, 'readFile', () =>
      Promise.resolve(
        JSON.stringify({
          templateSourceId: testTemplateJson.id,
          assetIcon: '16.png'
        })
      )
    )
    .stderr()
    .stdout()
    .command(['analytics:app:create', '--definitionfile', 'config/foo.json', '--json'])
    .it('runs analytics:app:create --definitionfile config/foo.json --json (with failure message)', ctx => {
      // in tests, the output seems to go stdout
      const output = ctx.stderr || ctx.stdout || '';
      expect(output, 'output').to.not.equal('');
      const results = JSON.parse(output) as unknown;
      expect(results, 'results').to.deep.include({
        status: 1,
        exitCode: 1,
        message: messages.getMessage('finishAppCreationFailure', ['failed']),
        result: {
          id: appId,
          events: [
            {
              EventType: 'Application',
              Index: 0,
              ItemLabel: 'foo',
              Message: 'failed',
              Status: 'Failed',
              Total: 0
            }
          ]
        }
      });
    });
});
