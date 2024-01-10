/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/sf-plugins-core/lib/test';
import { StreamingClient } from '@salesforce/core';

const messages = core.Messages.loadMessages('@salesforce/analytics', 'app');
const appId = '0llxx000000000zCAA';
const templateId = '0llxx000000000zCAA';

describe('analytics:app:update', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ id: appId }))
    .stdout()
    .command(['analytics:app:update', '--folderid', appId, '--templateid', templateId, '--async'])
    .it('runs analytics:app:update  --folderid 0llxx000000000zCAA --templateid 0llxx000000000zCAA --async', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('updateSuccess', [appId]));
    });

  // make sure --async --json returns just the app id
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ id: appId }))
    .stdout()
    .command(['analytics:app:update', '--folderid', appId, '--templateid', templateId, '--async', '--json'])
    .it(
      'runs analytics:app:update  --folderid 0llxx000000000zCAA --templateid 0llxx000000000zCAA --async --json',
      (ctx) => {
        expect(ctx.stdout).to.not.be.undefined.and.not.be.null.and.not.equal('');
        const results = JSON.parse(ctx.stdout) as unknown;
        expect(results, 'result').to.deep.include({
          status: 0,
          result: {
            id: appId,
          },
        });
      }
    );

  // make sure --json returns just the app id and results
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ id: appId }))
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
              Message: 'Success',
            },
            event: { replayId: 20 },
          });
        },
      };
    })
    .stdout()
    .command(['analytics:app:update', '--folderid', appId, '--templateid', templateId, '--json'])
    .it('runs analytics:app:update  --folderid 0llxx000000000zCAA --templateid 0llxx000000000zCAA --json', (ctx) => {
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
              Total: 0,
            },
          ],
        },
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
              Status: 'Success',
              ItemLabel: 'foo',
              FolderId: appId,
              Message: 'Success',
            },
            event: { replayId: 20 },
          }),
      };
    })
    .stdout()
    .command(['analytics:app:update', '--folderid', appId, '--templateid', templateId])
    .it('runs analytics:app:update  --folderid 0llxx000000000zCAA --templateid 0llxx000000000zCAA', (ctx) => {
      expect(ctx.stdout).to.contain(messages.getMessage('finishAppCreation', ['foo']));
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
              Message: 'failed',
            },
            event: { replayId: 20 },
          }),
      };
    })
    .stdout()
    .stderr()
    .command(['analytics:app:update', '--folderid', appId, '--templateid', templateId])
    .it('runs analytics:app:update  --folderid 0llxx000000000zCAA --templateid 0llxx000000000zCAA', (ctx) => {
      // this is in the list of events output
      expect(ctx.stdout).to.contain(messages.getMessage('finishAppCreationFailure', ['failed']));
      // and this is from the command failing
      expect(ctx.stderr).to.contain(messages.getMessage('finishAppCreationFailure', ['failed']));
    });
});
