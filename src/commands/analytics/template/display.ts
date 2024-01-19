/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  SfCommand,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import chalk from 'chalk';

import WaveTemplate, { type TemplateType } from '../../../lib/analytics/template/wavetemplate.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

function blue(s: string): string {
  return process.platform !== 'win32' ? chalk.blue(s) : s;
}

export default class Display extends SfCommand<TemplateType> {
  public static readonly summary = messages.getMessage('displayCommandDescription');
  public static readonly description = messages.getMessage('displayCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:template:display -t templateid',
    '$ sfdx analytics:template:display -n templatename',
  ];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    templateid: Flags.salesforceId({
      char: 't',
      summary: messages.getMessage('templateidFlagDescription'),
      description: messages.getMessage('templateidFlagLongDescription'),
      exclusive: ['templatename'],
    }),
    templatename: Flags.string({
      char: 'n',
      summary: messages.getMessage('templatenameFlagDescription'),
      description: messages.getMessage('templatenameFlagLongDescription'),
      exclusive: ['templateid'],
    }),
  };

  public async run() {
    const { flags } = await this.parse(Display);
    const templateInput = (flags.templateid ?? flags.templatename) as string;
    if (templateInput == null) {
      throw new SfError(messages.getMessage('missingRequiredField'));
    }
    const template = new WaveTemplate(flags['target-org'].getConnection(flags['api-version']));
    const templateRep = await template.fetch(templateInput);

    // force:org:display does a blue chalk on the headers, so do it here, too
    this.styledHeader(blue(messages.getMessage('displayDetailHeader')));
    this.table(
      [
        { key: 'Name', value: templateRep.name },
        { key: 'Namespace', value: templateRep.namespace },
        { key: 'Label', value: templateRep.label },
        { key: 'Description', value: templateRep.description },
        { key: 'Id', value: templateRep.id },
        { key: 'Template Type', value: templateRep.templateType },
        { key: 'Folder Source Id', value: templateRep.folderSource?.id },
        { key: 'Asset Version', value: templateRep.assetVersion },
        { key: 'Template Version', value: templateRep.releaseInfo?.templateVersion },
      ],
      {
        key: { header: 'Key' },
        value: { header: 'Value' },
      }
    );

    return templateRep;
  }
}
