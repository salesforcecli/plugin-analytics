/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  SfCommand,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import WaveTemplate from '../../../lib/analytics/template/wavetemplate.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

export default class Create extends SfCommand<string | undefined> {
  public static readonly summary = messages.getMessage('createCommandDescription');
  public static readonly description = messages.getMessage('createCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:template:create -f folderid',
    '$ sfdx analytics:template:create -f folderid -r "recipeid1, recipeid2"',
    '$ sfdx analytics:template:create -f folderid -d "datatransformid1, datatransformid2"',
  ];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    folderid: Flags.salesforceId({
      char: 'f',
      required: true,
      summary: messages.getMessage('folderidFlagDescription'),
      description: messages.getMessage('folderidFlagLongDescription'),
    }),
    // recipeids only work in 238+, they are silently ignored on the server in 236-
    recipeids: Flags.string({
      char: 'r',
      required: false,
      multiple: true,
      delimiter: ',',
      summary: messages.getMessage('recipeidsFlagDescription'),
      description: messages.getMessage('recipeidsFlagLongDescription'),
    }),
    // datatransformids only work in 246+, they are silently ignored on the server in 244-
    datatransformids: Flags.string({
      char: 'd',
      required: false,
      multiple: true,
      delimiter: ',',
      summary: messages.getMessage('datatransformidsFlagDescription'),
      description: messages.getMessage('datatransformidsFlagLongDescription'),
    }),
    // label & description only work in 232+, they are silently ignored on the server in 230
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('templateLabelFlagDescription'),
      description: messages.getMessage('templateLabelFlagLongDescription'),
    }),
    description: Flags.string({
      summary: messages.getMessage('templateDescriptionFlagDescription'),
      description: messages.getMessage('templateDescriptionFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Create);
    const template = new WaveTemplate(flags['target-org'].getConnection(flags['api-version']));
    // Create the wave template from an app/folder id
    const waveTemplateId = await template.create(flags.folderid, {
      label: flags.label,
      description: flags.description,
      recipeIds: flags.recipeids,
      datatransformIds: flags.datatransformids,
    });
    this.log(messages.getMessage('createSuccess', [waveTemplateId]));
    return waveTemplateId;
  }
}
