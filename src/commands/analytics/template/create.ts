/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import WaveTemplate from '../../../lib/analytics/template/wavetemplate';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

export default class Create extends SfdxCommand {
  public static description = messages.getMessage('createCommandDescription');
  public static longDescription = messages.getMessage('createCommandLongDescription');

  public static examples = ['$ sfdx analytics:template:create -f folderid'];

  protected static flagsConfig = {
    folderid: flags.id({
      char: 'f',
      required: true,
      description: messages.getMessage('folderidFlagDescription'),
      longDescription: messages.getMessage('folderidFlagLongDescription')
    }),
    // label & description only work in 232+, they are sliently ignored on the server in 230
    label: flags.string({
      char: 'l',
      description: messages.getMessage('templateLabelFlagDescription'),
      longDescription: messages.getMessage('templateLabelFlagLongDescription')
    }),
    description: flags.string({
      description: messages.getMessage('templateDescriptionFlagDescription'),
      longDescription: messages.getMessage('templateDescriptionFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const template = new WaveTemplate(this.org as Org);
    // Create the wave template from an app/folder id
    const waveTemplateId = await template.create(this.flags.folderid as string, {
      label: this.flags.label as string | undefined,
      description: this.flags.description as string | undefined
    });
    this.ux.log(messages.getMessage('createSuccess', [waveTemplateId]));
    return waveTemplateId;
  }
}
