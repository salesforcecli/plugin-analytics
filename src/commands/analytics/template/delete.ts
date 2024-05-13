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
import { Messages, Org } from '@salesforce/core';

import Folder from '../../../lib/analytics/app/folder.js';
import WaveTemplate from '../../../lib/analytics/template/wavetemplate.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

export default class Delete extends SfCommand<string | undefined> {
  public static readonly summary = messages.getMessage('deleteCommandDescription');
  public static readonly description = messages.getMessage('deleteCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:template:delete -t templateid'];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    templateid: Flags.salesforceId({
      char: 't',
      required: true,
      summary: messages.getMessage('templateidFlagDescription'),
      description: messages.getMessage('templateidFlagLongDescription'),
    }),
    forcedelete: Flags.boolean({
      summary: messages.getMessage('forceDeleteTemplateFlagDescription'),
      description: messages.getMessage('forceDeleteTemplateFlagLongDescription'),
    }),
    decouple: Flags.boolean({
      summary: messages.getMessage('decoupleTemplateFlagDescription'),
      description: messages.getMessage('decoupleTemplateFlagLongDescription'),
    }),
    noprompt: Flags.boolean({
      char: 'p',
      summary: messages.getMessage('nopromptFlagDescription'),
      description: messages.getMessage('nopromptFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Delete);
    if (
      flags.noprompt ||
      (await this.confirm({
        message: messages.getMessage(
          flags.forcedelete ? 'confirmForceDeleteYesNo' : flags.decouple ? 'confirmDecoupleYesNo' : 'confirmDeleteYesNo'
        ),
      }))
    ) {
      await this.executeCommand(flags);
    }
    return flags.templateid;
  }

  private async executeCommand(flags: {
    'target-org': Org;
    'api-version': string | undefined;
    templateid: string;
    forcedelete: boolean;
    decouple: boolean;
  }) {
    const templateid = flags.templateid;
    const forceDelete = flags.forcedelete;
    const decouple = flags.decouple;

    const connection = flags['target-org'].getConnection(flags['api-version']);
    const wavetemplate = new WaveTemplate(connection);
    // make sure we can find this template and if not let it error from the api
    await wavetemplate.fetch(templateid);

    if (forceDelete || decouple) {
      const folderSvc = new Folder(connection);
      const folders = (await folderSvc.list()).filter((folder) => folder.templateSourceId === templateid && folder.id);

      if (folders && folders.length > 0) {
        for (const folder of folders) {
          if (forceDelete) {
            await folderSvc.deleteFolder(folder.id);
            this.log(messages.getMessage('deleteAppSuccess', [folder.label ?? folder.name, folder.id]));
          } else {
            await folderSvc.decouple(folder.id, templateid);
            this.log(messages.getMessage('decoupleAppSuccess', [folder.label ?? folder.name, folder.id]));
          }
        }
      }
    }

    // Delete the template
    await wavetemplate.deleteTemplate(templateid);

    this.log(messages.getMessage('deleteTemplateSuccess', [templateid]));
  }
}
