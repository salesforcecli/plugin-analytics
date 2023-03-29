/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promises as fs } from 'fs';
import { EOL } from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import Folder, { CreateAppBody } from '../../../lib/analytics/app/folder';
import AppStreaming from '../../../lib/analytics/event/appStreaming';
import { DEF_APP_CREATE_UPDATE_TIMEOUT } from '../../../lib/analytics/constants';
import WaveTemplate from '../../../lib/analytics/template/wavetemplate';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

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
    appdescription: flags.string({
      description: messages.getMessage('appdescriptionFlagDescription'),
      longDescription: messages.getMessage('appdescriptionFlagLongDescription')
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
      longDescription: messages.getMessage('streamingWaitLongDescription', [DEF_APP_CREATE_UPDATE_TIMEOUT]),
      min: 0,
      default: DEF_APP_CREATE_UPDATE_TIMEOUT
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const folder = new Folder(this.org as Org);
    const body = await this.generateCreateAppBody();

    const appStreaming = new AppStreaming(
      this.org as Org,
      this.flags.allEvents as boolean,
      this.flags.wait as number,
      this.ux
    );

    // if they're not creating from a template (i.e. an empty app), then don't listen for events since there won't be
    // any and this will just hang until the timeout
    if (this.flags.async || this.flags.wait <= 0 || !body.templateSourceId) {
      const waveAppId = await appStreaming.createApp(folder, body);
      this.ux.log(messages.getMessage('createAppSuccessAsync', [waveAppId]));
      return { id: waveAppId };
    } else {
      const waveAppId = await appStreaming.streamCreateEvent(folder, body);
      return { id: waveAppId, events: appStreaming.getStreamingResults() };
    }
  }

  private async generateCreateAppBody(): Promise<CreateAppBody> {
    if (this.flags.templateid || this.flags.templatename) {
      const templateSvc = new WaveTemplate(this.org as Org);
      const matchedTemplate = this.flags.templateid
        ? await templateSvc.fetch(this.flags.templateid as string)
        : (await templateSvc.list()).find(
            template => template.name === this.flags.templatename || template.label === this.flags.templatename
          );
      if (!matchedTemplate) {
        throw new SfdxError(`Template '${this.flags.templateid || this.flags.templatename}' not found.`);
      }
      return {
        description: (this.flags.appdescription || matchedTemplate.description) as string,
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
      body.description = (body.description ?? this.flags.appdescription) as string;
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
}
