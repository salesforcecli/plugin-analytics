/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import chalk from 'chalk';

import WaveTemplate from '../../../lib/analytics/template/wavetemplate';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

function blue(s: string): string {
  return process.platform !== 'win32' ? chalk.blue(s) : s;
}

export default class Display extends SfdxCommand {
  public static description = messages.getMessage('displayCommandDescription');
  public static longDescription = messages.getMessage('displayCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:template:display -t templateid',
    '$ sfdx analytics:template:display -n templatename'
  ];

  protected static flagsConfig = {
    templateid: flags.id({
      char: 't',
      description: messages.getMessage('templateidFlagDescription'),
      longDescription: messages.getMessage('templateidFlagLongDescription'),
      exclusive: ['templatename']
    }),
    templatename: flags.string({
      char: 'n',
      description: messages.getMessage('templatenameFlagDescription'),
      longDescription: messages.getMessage('templatenameFlagLongDescription'),
      exclusive: ['templateid']
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const templateInput = (this.flags.templateid ?? this.flags.templatename) as string;
    if (templateInput == null) {
      throw new SfdxError(messages.getMessage('missingRequiredField'));
    }
    const template = new WaveTemplate(this.org as Org);
    const templateRep = await template.fetch(templateInput);

    // force:org:display does a blue chalk on the headers, so do it here, too
    this.ux.styledHeader(blue(messages.getMessage('displayDetailHeader')));
    this.ux.table(
      [
        { key: 'Name', value: templateRep.name },
        { key: 'Namespace', value: templateRep.namespace },
        { key: 'Label', value: templateRep.label },
        { key: 'Description', value: templateRep.description },
        { key: 'Id', value: templateRep.id },
        { key: 'Template Type', value: templateRep.templateType },
        { key: 'Folder Source Id', value: templateRep.folderSource?.id },
        { key: 'Asset Version', value: templateRep.assetVersion }
      ],
      {
        columns: [
          { key: 'key', label: 'Key' },
          { key: 'value', label: 'Value' }
        ]
      }
    );

    return templateRep;
  }
}
