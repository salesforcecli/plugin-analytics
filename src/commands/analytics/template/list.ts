/*
 * Copyright (c) 2021, salesforce.com, inc.
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
import { Messages } from '@salesforce/core';

import WaveTemplate from '../../../lib/analytics/template/wavetemplate.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

type TemplateInfo = {
  name?: string;
  label?: string;
  templateid?: string;
  templatetype?: string;
  folderid?: string;
  namespace?: string;
  templateversion?: string;
};

export default class List extends SfCommand<TemplateInfo[]> {
  public static readonly summary = messages.getMessage('listCommandDescription');
  public static readonly description = messages.getMessage('listCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:template:list',
    '$ sfdx analytics:template:list --includembeddedtemplates',
    '$ sfdx analytics:template:list --includesalesforcetemplates',
  ];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    includesalesforcetemplates: Flags.boolean({
      char: 'a',
      summary: messages.getMessage('includeSalesforceTemplatesFlagDescription'),
      description: messages.getMessage('includeSalesforceTemplatesFlagLongDescription'),
    }),
    includembeddedtemplates: Flags.boolean({
      char: 'e',
      summary: messages.getMessage('includeEmbeddedAppTemplatesFlagDescription'),
      description: messages.getMessage('includeEmbeddedAppTemplatesFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(List);
    const wavetemplate = new WaveTemplate(flags['target-org'].getConnection(flags['api-version']));
    const templates = ((await wavetemplate.list(flags.includembeddedtemplates)) || [])
      .filter((template) => flags.includesalesforcetemplates || template.id?.startsWith('0Nk'))
      .map((template) => ({
        name: template.name,
        label: template.label,
        templateid: template.id,
        templatetype: template.templateType,
        folderid: template.folderSource?.id,
        namespace: template.namespace,
        templateversion: template.releaseInfo?.templateVersion,
      }));
    this.styledHeader(messages.getMessage('templatesFound', [templates.length]));
    this.table(templates, {
      name: { header: 'name' },
      label: { header: 'label' },
      templateid: { header: 'templateid' },
      templatetype: { header: 'templatetype' },
      folderid: { header: 'folderid' },
      namespace: { header: 'namespace' },
      templateversion: { header: 'templateversion' },
    });

    return templates;
  }
}
