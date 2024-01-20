/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages, SfError, StreamingClient } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { stubMethod } from '@salesforce/ts-sinon';
import { expect } from 'chai';
import Update from '../../../src/commands/analytics/app/update.js';
import { getJsonOutput, getStdout, stubDefaultOrg } from '../../testutils.js';

const messages = Messages.loadMessages('@salesforce/analytics', 'app');

const appId = '0llxx000000000zCAA';
const templateId = '0llxx000000000zCAA';

describe('analytics:app:update', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --folderid ${appId} --templateid ${templateId} --async`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ id: appId });

    await Update.run(['--folderid', appId, '--templateid', templateId, '--async']);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('updateSuccess', [appId]));
  });

  // make sure --async --json returns just the app id
  it(`runs: --folderid ${appId} --templateid ${templateId} --async --json`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ id: appId });

    await Update.run(['--folderid', appId, '--templateid', templateId, '--async', '--json']);
    expect(getJsonOutput(sfCommandStubs), 'result').to.deep.include({
      result: {
        id: appId,
      },
    });
  });

  it(`runs: --folderid ${appId} --templateid ${templateId}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ id: appId });
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
            FolderId: 'test',
            Message: 'Success',
          },
          event: { replayId: 20 },
        });
      },
    }));

    await Update.run(['--folderid', appId, '--templateid', templateId]);
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('finishAppCreation', ['foo']));
  });

  // make sure --json returns just the app id and results
  it(`runs: --folderid ${appId} --templateid ${templateId} --json`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ id: appId });
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
            FolderId: 'test',
            Message: 'Success',
          },
          event: { replayId: 20 },
        });
      },
    }));

    await Update.run(['--folderid', appId, '--templateid', templateId, '--json']);
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

  it(`runs: --folderid ${appId} --templateid ${templateId} (with failure)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve({ id: appId });
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

    try {
      await Update.run(['--folderid', appId, '--templateid', templateId]);
    } catch (error) {
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'message').to.contain(
        messages.getMessage('finishAppCreationFailure', ['failed'])
      );
      return;
    }
    expect.fail('Expected an error');
  });
});
