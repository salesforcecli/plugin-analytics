/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'node:os';
import { Flags, SfCommand, Ux, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages, Org, SfError } from '@salesforce/core';
import Folder, { CreateAppBody } from '../../../lib/analytics/app/folder.js';
import AppStreaming, { type StreamingResult } from '../../../lib/analytics/event/appStreaming.js';
import { DEF_APP_CREATE_UPDATE_TIMEOUT } from '../../../lib/analytics/constants.js';
import WaveTemplate from '../../../lib/analytics/template/wavetemplate.js';
import { fs } from '../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export default class Create extends SfCommand<{ id?: string; events?: StreamingResult[] }> {
  public static readonly summary = messages.getMessage('createCommandDescription');
  public static readonly description = messages.getMessage('createCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:app:create -t templateid -n appname',
    '$ sfdx analytics:app:create -m templatename',
    '$ sfdx analytics:app:create -f path_to_json_file',
  ];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    definitionfile: Flags.file({
      char: 'f',
      summary: messages.getMessage('appDefinitionFileFlagDescription'),
      description: messages.getMessage('appDefinitionFileFlagLongDescription'),
      exclusive: ['templatename', 'templateid'],
    }),
    templateid: Flags.string({
      char: 't',
      summary: messages.getMessage('templateidFlagDescriptionForCreate'),
      description: messages.getMessage('templateidFlagLongDescriptionForCreate'),
      exclusive: ['templatename', 'definitionfile'],
    }),
    templatename: Flags.string({
      char: 'm',
      summary: messages.getMessage('templatenameFlagDescription'),
      description: messages.getMessage('templatenameFlagLongDescription'),
      exclusive: ['templateid', 'definitionfile'],
    }),
    appname: Flags.string({
      char: 'n',
      summary: messages.getMessage('appnameFlagDescription'),
      description: messages.getMessage('appnameFlagLongDescription'),
    }),
    appdescription: Flags.string({
      summary: messages.getMessage('appdescriptionFlagDescription'),
      description: messages.getMessage('appdescriptionFlagLongDescription'),
    }),
    async: Flags.boolean({
      char: 'a',
      summary: messages.getMessage('appCreateAsyncDescription'),
      description: messages.getMessage('appCreateAsyncLongDescription'),
    }),
    allevents: Flags.boolean({
      char: 'v',
      summary: messages.getMessage('appCreateAllEventsDescription'),
      description: messages.getMessage('appCreateAllEventsLongDescription'),
    }),
    wait: Flags.integer({
      char: 'w',
      summary: messages.getMessage('streamingWaitDescription'),
      description: messages.getMessage('streamingWaitLongDescription', [DEF_APP_CREATE_UPDATE_TIMEOUT]),
      min: 0,
      default: DEF_APP_CREATE_UPDATE_TIMEOUT,
    }),
  };

  public async run() {
    const { flags } = await this.parse(Create);
    const folder = new Folder(flags.targetOrg);
    const body = await generateCreateAppBody(flags);

    const appStreaming = new AppStreaming(
      flags.targetOrg,
      flags.allevents,
      flags.wait,
      new Ux({ jsonEnabled: this.jsonEnabled() })
    );

    // if they're not creating from a template (i.e. an empty app), then don't listen for events since there won't be
    // any and this will just hang until the timeout
    if (flags.async || flags.wait <= 0 || !body.templateSourceId) {
      const waveAppId = await appStreaming.createApp(folder, body);
      this.log(messages.getMessage('createAppSuccessAsync', [waveAppId]));
      return { id: waveAppId };
    } else {
      const waveAppId = await appStreaming.streamCreateEvent(folder, body);
      return { id: waveAppId, events: appStreaming.getStreamingResults() };
    }
  }
}

async function generateCreateAppBody({
  targetOrg,
  templateid,
  templatename,
  appdescription,
  appname,
  definitionfile,
}: {
  targetOrg: Org;
  templateid?: string;
  templatename?: string;
  appdescription?: string;
  appname?: string;
  definitionfile?: string;
}): Promise<CreateAppBody> {
  if (templateid ?? templatename) {
    const templateSvc = new WaveTemplate(targetOrg);
    const matchedTemplate = templateid
      ? await templateSvc.fetch(templateid)
      : (await templateSvc.list()).find(
          (template) => template.name === templatename || template.label === templatename
        );
    if (!matchedTemplate) {
      throw new SfError(`Template '${templateid ?? templatename}' not found.`);
    }
    return {
      description: appdescription ?? matchedTemplate.description,
      label: appname ?? matchedTemplate.label,
      templateSourceId: matchedTemplate.id,
      assetIcon: '16.png',
      templateValues: {},
      name: appname ?? matchedTemplate.name,
    };
  } else if (definitionfile) {
    let json: unknown;
    try {
      json = JSON.parse(await fs.readFile(definitionfile));
    } catch (e) {
      throw new SfError(
        `Error parsing ${definitionfile}`,
        undefined,
        undefined,
        undefined,
        e instanceof Error ? e : new Error(e ? String(e) : '<unknown>')
      );
    }
    if (typeof json !== 'object') {
      throw new SfError(`Invalid json in ${definitionfile}, expected an object, found a ${typeof json}`);
    }
    const body = json as CreateAppBody;
    // if they didn't put a name in the defintion file json but did on the command line, squish it into the json
    if (appname && (!body.name || !body.label)) {
      body.name = body.name ?? appname;
      body.label = body.label ?? appname;
    }
    body.description = body.description ?? appdescription;
    return body;
  } else {
    throw new SfError(
      // this is similar to what sfdx prints out if use required: true on a missing flag
      `Missing one of the following required flags:${EOL}` +
        ` -f, --definitionfile DEFINITIONFILE${EOL}` +
        ` -t, --templateid TEMPLATEID${EOL}` +
        ` -m, --templatename TEMPLATENAME${EOL}` +
        'See more help with --help'
    );
  }
}
