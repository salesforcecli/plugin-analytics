/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Logger, Messages, Org, StatusResult, StreamingClient } from '@salesforce/core';
import { type JsonMap } from '@salesforce/ts-types';
import chalk from 'chalk';
import { Duration } from '@salesforce/kit';
import Folder, { CreateAppBody } from '../app/folder.js';
import { CommandUx, throwWithData } from '../utils.js';
import WaveAssetEvent from './waveAssetEvent.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export type StreamingResult = {
  EventType: string;
  Status: string;
  Index: number;
  Total: number;
  ItemLabel: string;
  Message: string;
};

function getStreamResultMark(success: boolean) {
  if (process.platform === 'win32') {
    return '';
  }
  if (success) {
    return chalk.green('✔');
  }
  return chalk.red('✖');
}

export default class AppStreaming {
  public streamingResults = [] as StreamingResult[];

  protected logger: Logger | undefined;
  protected ux: CommandUx;
  protected allEvents = false;
  protected org: Org;
  protected wait: number;

  public constructor(organization: Org, allEvents: boolean, wait: number, ux: CommandUx) {
    this.allEvents = allEvents;
    this.org = organization;
    this.wait = wait;
    this.ux = ux;
  }

  public async createApp(folder: Folder, body: CreateAppBody) {
    const waveAppId = await folder.create(body);
    this.ux.styledHeader(messages.getMessage('startAppCreation', [waveAppId]));
    return waveAppId;
  }

  public async updateApp(folder: Folder, folderId: string, templateId: string) {
    const waveAppId = await folder.update(folderId, templateId);
    this.ux.styledHeader(messages.getMessage('startAppUpdate', [waveAppId]));
    return waveAppId;
  }

  public getStreamingResults() {
    return this.streamingResults;
  }

  public async streamCreateEvent(folder: Folder, body: CreateAppBody) {
    let folderId: string | undefined;
    const options = new StreamingClient.DefaultOptions(this.org, '/event/WaveAssetEvent', (message) =>
      this.streamProcessor(folderId, message)
    );
    const asyncStatusClient: StreamingClient = await this.createStreamingClient(options);

    try {
      await asyncStatusClient.subscribe(async () => {
        folderId = await this.createApp(folder, body);
      });
    } catch (error) {
      if ((error as Record<string, unknown>).code === 'genericTimeoutMessage') {
        // include the app id in the error if we timeout waiting, since the app got created
        throwWithData(messages.getMessage('timeoutMessage', [(error as Record<string, unknown>).message as string]), {
          id: folderId,
        });
      }
      throw error;
    }
    return folderId;
  }

  public async streamUpdateEvent(folder: Folder, folderId: string, templateId: string) {
    const options = new StreamingClient.DefaultOptions(this.org, '/event/WaveAssetEvent', (message) =>
      this.streamProcessor(folderId, message)
    );
    const asyncStatusClient: StreamingClient = await this.createStreamingClient(options);
    try {
      await asyncStatusClient.subscribe(async () => {
        await this.updateApp(folder, folderId, templateId);
      });
    } catch (error) {
      if ((error as Record<string, unknown>).code === 'genericTimeoutMessage') {
        // include the app id in the error if we timeout waiting, since the app got created
        throwWithData(messages.getMessage('timeoutMessage', [(error as Record<string, unknown>).message as string]), {
          id: folderId,
        });
      }
      throw error;
    }
    return folderId;
  }

  private streamProcessor(folderId: string | undefined, event: JsonMap): StatusResult {
    const waveAssetEvent = new WaveAssetEvent(event);

    // Only handle events for the newly created folder id and ignore for tests
    if (folderId !== waveAssetEvent.folderId && waveAssetEvent.folderId !== 'test') {
      return { completed: false };
    }
    switch (waveAssetEvent.eventType) {
      case 'ExternalData': {
        this.logEvent('External Data', 'created', waveAssetEvent);
        break;
      }
      case 'Dataset': {
        this.logEvent('Datasets', 'created', waveAssetEvent);
        break;
      }
      case 'Lens': {
        this.logEvent('Lenses', 'created', waveAssetEvent);
        break;
      }
      case 'Dashboard': {
        this.logEvent('Dashboards', 'created', waveAssetEvent);
        break;
      }
      case 'Dataflow': {
        this.logEvent('Dataflows', 'created', waveAssetEvent);
        break;
      }
      case 'Recipe': {
        this.logEvent('Recipes', 'created', waveAssetEvent);
        break;
      }
      case 'ExecutionPlan': {
        this.logEvent('Execution Plan', 'created', waveAssetEvent);
        break;
      }
      case 'UserDataflowInstance': {
        this.logEvent('User Dataflow Instructions', 'executed', waveAssetEvent);
        break;
      }
      case 'ExtendedType': {
        this.logEvent('Template Extensions', 'created', waveAssetEvent);
        break;
      }
      case 'SystemDataflowInstance': {
        this.logEvent('System Dataflow Instructions', 'executed', waveAssetEvent);
        break;
      }
      case 'ReplicationDataflowInstance': {
        this.logEvent('Replication Dataflow Instructions', 'executed', waveAssetEvent);
        break;
      }
      case 'UserXmd': {
        this.logEvent('User XMDs', 'created', waveAssetEvent);
        break;
      }
      case 'AssetPruning': {
        this.logEvent('Asset', 'deleted', waveAssetEvent);
        break;
      }
      case 'Image': {
        this.logEvent('Images', 'created', waveAssetEvent);
        break;
      }
      case 'Application': {
        this.createEventJson(waveAssetEvent);
        if (waveAssetEvent.status === 'Success') {
          this.ux.log(
            getStreamResultMark(true) + ' ' + messages.getMessage('finishAppCreation', [waveAssetEvent.label])
          );
        } else {
          // failed or cancelled
          this.ux.log(
            getStreamResultMark(false) + ' ' + messages.getMessage('finishAppCreationFailure', [waveAssetEvent.message])
          );
          throwWithData(messages.getMessage('finishAppCreationFailure', [waveAssetEvent.message]), {
            id: folderId,
            events: this.streamingResults,
          });
        }
        return { completed: true };
      }
    }
    return { completed: false };
  }

  private logEvent(eventDisplayName: string, action: string, event: WaveAssetEvent) {
    if (this.allEvents && event.total > 0) {
      this.createEventJson(event);
      if (event.status === 'Success') {
        this.ux.log(
          getStreamResultMark(true) +
            ' ' +
            messages.getMessage('verboseAppCreateEventSuccess', [
              messages.getMessage('appCreateSuccessfulLabel'),
              eventDisplayName,
              event.index,
              event.total,
              event.label,
            ])
        );
      } else {
        this.ux.log(
          getStreamResultMark(false) +
            ' ' +
            messages.getMessage('appCreateEventFail', [
              messages.getMessage('appCreateEventFailureLabel'),
              eventDisplayName,
              event.index,
              event.total,
              event.label,
              event.message,
            ])
        );
      }
    } else {
      if (event.status === 'Success' && event.total > 0 && event.total === event.index) {
        this.createEventJson(event);
        this.ux.log(
          getStreamResultMark(true) +
            ' ' +
            messages.getMessage('appCreateEvent', [event.total, eventDisplayName, action])
        );
      }
      if (event.status !== 'Success') {
        this.createEventJson(event);
        this.ux.log(
          getStreamResultMark(true) +
            ' ' +
            messages.getMessage('appCreateEventFail', [
              messages.getMessage('appCreateEventFailureLabel'),
              eventDisplayName,
              event.index,
              event.total,
              event.label,
              event.message,
            ])
        );
      }
    }
  }

  private async createStreamingClient(options: StreamingClient.DefaultOptions) {
    const timeout: Duration = Duration.minutes(this.wait);
    options.setHandshakeTimeout(timeout);
    options.setSubscribeTimeout(timeout);
    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);
    await asyncStatusClient.handshake();
    // Stream all WaveAssetEvents events for this org
    asyncStatusClient.replay(-1);
    return asyncStatusClient;
  }

  private createEventJson(event: WaveAssetEvent) {
    const entry = {
      EventType: event.eventType,
      Status: event.status,
      Index: event.index,
      Total: event.total,
      ItemLabel: event.label,
      Message: event.message,
    };
    this.streamingResults.push(entry);
  }
}
