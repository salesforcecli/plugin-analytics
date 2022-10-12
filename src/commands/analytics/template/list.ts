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

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listCommandDescription');
  public static longDescription = messages.getMessage('listCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:template:list',
    '$ sfdx analytics:template:list --includembeddedtemplates',
    '$ sfdx analytics:template:list --includesalesforcetemplates'
  ];

  protected static flagsConfig = {
    includesalesforcetemplates: flags.boolean({
      char: 'a',
      description: messages.getMessage('includeSalesforceTemplatesFlagDescription'),
      longDescription: messages.getMessage('includeSalesforceTemplatesFlagLongDescription')
    }),
    includembeddedtemplates: flags.boolean({
      char: 'e',
      description: messages.getMessage('includeEmbeddedAppTemplatesFlagDescription'),
      longDescription: messages.getMessage('includeEmbeddedAppTemplatesFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = [
    'name',
    'label',
    'templateid',
    'templatetype',
    'templateversion',
    'folderid',
    'namespace'
  ];

  public async run() {
    const wavetemplate = new WaveTemplate(this.org as Org);
    const templates = ((await wavetemplate.list(!!this.flags.includembeddedtemplates)) || [])
      .filter(template => this.flags.includesalesforcetemplates || template.id?.startsWith('0Nk'))
      .map(template => ({
        name: template.name,
        label: template.label,
        templateid: template.id,
        templatetype: template.templateType,
        templateversion: template.releaseInfo?.templateVersion ?? null,
        folderid: template.folderSource?.id ?? null,
        namespace: template.namespace
      }));
    if (templates.length) {
      this.ux.styledHeader(messages.getMessage('templatesFound', [templates.length]));
    }
    return templates;
  }
}
