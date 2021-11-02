/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { fs, Messages, Org, SfdxError, StatusResult, StreamingClient } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { JsonMap } from '@salesforce/ts-types';
import chalk from 'chalk';
import Folder, { CreateAppBody } from '../../../lib/analytics/app/folder';
import { DEF_APP_CREATE_TIMEOUT } from '../../../lib/analytics/constants';
import WaveAssetEvent from '../../../lib/analytics/event/waveAssetEvent';
import WaveTemplate from '../../../lib/analytics/template/wavetemplate';
import { throwWithData } from '../../../lib/analytics/utils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

type StreamingResult = {
  EventType: string;
  Status: string;
  Index: number;
  Total: number;
  ItemLabel: string;
  Message: string;
};

export default class Create extends SfdxCommand {
  public static description = messages.getMessage('createCommandDescription');
  public static longDescription = messages.getMessage('createCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:app:create -t templateid -n appname',
    '$ sfdx analytics:app:create -m templatename',
    '$ sfdx analytics:app:create -f path_to_json_file'
  ];

  protected static flagsConfig = {
    definitionfile: flags.filepath({
      char: 'f',
      description: messages.getMessage('appDefinitionFileFlagDescription'),
      longDescription: messages.getMessage('appDefinitionFileFlagLongDescription'),
      exclusive: ['templatename', 'templateid']
    }),
    templateid: flags.string({
      char: 't',
      description: messages.getMessage('templateidFlagDescriptionForCreate'),
      longDescription: messages.getMessage('templateidFlagLongDescriptionForCreate'),
      exclusive: ['templatename', 'definitionfile']
    }),
    templatename: flags.string({
      char: 'm',
      description: messages.getMessage('templatenameFlagDescription'),
      longDescription: messages.getMessage('templatenameFlagLongDescription'),
      exclusive: ['templateid', 'definitionfile']
    }),
    appname: flags.string({
      char: 'n',
      description: messages.getMessage('appnameFlagDescription'),
      longDescription: messages.getMessage('appnameFlagLongDescription')
    }),
    async: flags.boolean({
      char: 'a',
      description: messages.getMessage('appCreateAsyncDescription'),
      longDescription: messages.getMessage('appCreateAsyncLongDescription')
    }),
    allevents: flags.boolean({
      char: 'v',
      description: messages.getMessage('appCreateAllEventsDescription'),
      longDescription: messages.getMessage('appCreateAllEventsLongDescription')
    }),
    wait: flags.number({
      char: 'w',
      description: messages.getMessage('streamingWaitDescription'),
      longDescription: messages.getMessage('streamingWaitLongDescription', [DEF_APP_CREATE_TIMEOUT]),
      min: 0,
      default: DEF_APP_CREATE_TIMEOUT
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public streamingResults = [] as StreamingResult[];

  public async run() {
    const folder = new Folder(this.org as Org);
    const body = await this.generateCreateAppBody();

    // if they're not creating from a template (i.e. an empty app), then don't listen for events since there won't be
    // any and this will just hang until the timeout
    if (this.flags.async || this.flags.wait <= 0 || !body.templateSourceId) {
      const waveAppId = await this.createApp(folder, body);
      this.ux.log(messages.getMessage('createAppSuccessAsync', [waveAppId]));
      return { id: waveAppId };
    } else {
      const waveAppId = await this.streamEvent(folder, body);
      return { id: waveAppId, events: this.streamingResults };
    }
  }

  private async generateCreateAppBody(): Promise<CreateAppBody> {
    if (this.flags.templateid || this.flags.templatename) {
      const templateSvc = new WaveTemplate(this.org as Org);
      const matchedTemplate = this.flags.templateid
        ? await templateSvc.fetch(this.flags.templateid)
        : (await templateSvc.list()).find(
            template => template.name === this.flags.templatename || template.label === this.flags.templatename
          );
      if (!matchedTemplate) {
        throw new SfdxError(`Template '${this.flags.templateid || this.flags.templatename}' not found.`);
      }
      return {
        description: matchedTemplate.description,
        label: (this.flags.appname || matchedTemplate.label) as string,
        templateSourceId: matchedTemplate.id,
        assetIcon: '16.png',
        templateValues: {},
        name: (this.flags.appname || matchedTemplate.name) as string
      };
    } else if (this.flags.definitionfile) {
      const path = String(this.flags.definitionfile);
      let json: unknown;
      try {
        json = JSON.parse(await fs.readFile(path, 'utf8'));
      } catch (e) {
        throw new SfdxError(
          `Error parsing ${path}`,
          undefined,
          undefined,
          undefined,
          e instanceof Error ? e : new Error(e ? String(e) : '<unknown>')
        );
      }
      if (typeof json !== 'object') {
        throw new SfdxError(`Invalid json in ${path}, expected an object, found a ${typeof json}`);
      }
      const body = json as CreateAppBody;
      // if they didn't put a name in the defintion file json but did on the command line, squish it into the json
      if (this.flags.appname && (!body.name || !body.label)) {
        body.name = (body.name || this.flags.appname) as string;
        body.label = (body.label || this.flags.appname) as string;
      }
      return body;
    } else {
      throw new SfdxError(
        // this is similar to what sfdx prints out if use required: true on a missing flag
        `Missing one of the following required flags:${EOL}` +
          ` -f, --definitionfile DEFINITIONFILE${EOL}` +
          ` -t, --templateid TEMPLATEID${EOL}` +
          ` -m, --templatename TEMPLATENAME${EOL}` +
          'See more help with --help'
      );
    }
  }

  private async streamEvent(folder: Folder, body: CreateAppBody) {
    let folderId: string | undefined;
    const options = new StreamingClient.DefaultOptions(this.org as Org, '/event/WaveAssetEvent', message =>
      this.streamProcessor(folderId, message)
    );
    const timeout: Duration = Duration.minutes(this.flags.wait);
    options.setHandshakeTimeout(timeout);
    options.setSubscribeTimeout(timeout);
    const asyncStatusClient: StreamingClient = await StreamingClient.create(options);
    await asyncStatusClient.handshake();
    // Stream all WaveAssetEvents events for this org
    asyncStatusClient.replay(-1);
    try {
      await asyncStatusClient.subscribe(async () => {
        folderId = await this.createApp(folder, body);
      });
    } catch (error) {
      if ((error as Record<string, unknown>).code === 'genericTimeoutMessage') {
        // include the app id in the error if we timeout waiting, since the app got created
        throwWithData(messages.getMessage('timeoutMessage', [(error as Record<string, unknown>).message as string]), {
          id: folderId
        });
      }
      throw error;
    }
    return folderId;
  }

  private async createApp(folder: Folder, body: CreateAppBody) {
    const waveAppId = await folder.create(body);
    this.ux.styledHeader(messages.getMessage('startAppCreation', [waveAppId]));
    return waveAppId;
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
          this.ux.log(this.getStreamResultMark(true), messages.getMessage('finishAppCreation', [waveAssetEvent.label]));
        } else {
          // failed or cancelled
          this.ux.log(
            this.getStreamResultMark(false),
            messages.getMessage('finishAppCreationFailure', [waveAssetEvent.message])
          );
          throwWithData(messages.getMessage('finishAppCreationFailure', [waveAssetEvent.message]), {
            id: folderId,
            events: this.streamingResults
          });
        }
        return { completed: true };
      }
    }
    return { completed: false };
  }

  private getStreamResultMark(success: boolean) {
    if (process.platform === 'win32') {
      return '';
    }
    if (success) {
      return chalk.green('✔');
    }
    return chalk.red('✖');
  }

  private logEvent(eventDisplayName: string, action: string, event: WaveAssetEvent) {
    if (this.flags.allevents && event.total > 0) {
      this.createEventJson(event);
      if (event.status === 'Success') {
        this.ux.log(
          this.getStreamResultMark(true),
          messages.getMessage('verboseAppCreateEventSuccess', [
            messages.getMessage('appCreateSuccessfulLabel'),
            eventDisplayName,
            event.index,
            event.total,
            event.label
          ])
        );
      } else {
        this.ux.log(
          this.getStreamResultMark(false),
          messages.getMessage('appCreateEventFail', [
            messages.getMessage('appCreateEventFailureLabel'),
            eventDisplayName,
            event.index,
            event.total,
            event.label,
            event.message
          ])
        );
      }
    } else {
      if (event.status === 'Success' && event.total > 0 && event.total === event.index) {
        this.createEventJson(event);
        this.ux.log(
          this.getStreamResultMark(true),
          messages.getMessage('appCreateEvent', [event.total, eventDisplayName, action])
        );
      }
      if (event.status !== 'Success') {
        this.createEventJson(event);
        this.ux.log(
          this.getStreamResultMark(true),
          messages.getMessage('appCreateEventFail', [
            messages.getMessage('appCreateEventFailureLabel'),
            eventDisplayName,
            event.index,
            event.total,
            event.label,
            event.message
          ])
        );
      }
    }
  }

  private createEventJson(event: WaveAssetEvent) {
    const entry = {
      EventType: event.eventType,
      Status: event.status,
      Index: event.index,
      Total: event.total,
      ItemLabel: event.label,
      Message: event.message
    };
    this.streamingResults.push(entry);
  }
}
