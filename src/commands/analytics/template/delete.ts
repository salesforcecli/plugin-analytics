/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import { cli } from 'cli-ux';

import Folder from '../../../lib/analytics/app/folder';
import WaveTemplate from '../../../lib/analytics/template/wavetemplate';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

export default class Delete extends SfdxCommand {
  public static description = messages.getMessage('deleteCommandDescription');
  public static longDescription = messages.getMessage('deleteCommandLongDescription');

  public static examples = ['$ sfdx analytics:template:delete -t templateid'];

  protected static flagsConfig = {
    templateid: flags.id({
      char: 't',
      required: true,
      description: messages.getMessage('templateidFlagDescription'),
      longDescription: messages.getMessage('templateidFlagLongDescription')
    }),
    forcedelete: flags.boolean({
      description: messages.getMessage('forceDeleteTemplateFlagDescription'),
      longDescription: messages.getMessage('forceDeleteTemplateFlagLongDescription')
    }),
    decouple: flags.boolean({
      description: messages.getMessage('decoupleTemplateFlagDescription'),
      longDescription: messages.getMessage('decoupleTemplateFlagLongDescription')
    }),
    noprompt: flags.boolean({
      char: 'p',
      description: messages.getMessage('nopromptFlagDescription'),
      longDescription: messages.getMessage('nopromptFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    if (this.flags.noprompt) {
      await this.executeCommand();
    } else {
      const answer = (await cli.prompt(
        messages.getMessage(
          (!!this.flags.forcedelete && 'confirmForceDeleteYesNo') ||
            (!!this.flags.decouple && 'confirmDecoupleYesNo') ||
            'confirmDeleteYesNo'
        )
      )) as string;
      if (answer.toUpperCase() === 'YES' || answer.toUpperCase() === 'Y') {
        await this.executeCommand();
      }
    }
    return this.flags.templateid as string;
  }

  private async executeCommand() {
    const templateid = this.flags.templateid as string;
    const forceDelete = !!this.flags.forcedelete;
    const decouple = !!this.flags.decouple;

    const wavetemplate = new WaveTemplate(this.org as Org);
    // make sure we can find this template and if not let it error from the api
    await wavetemplate.fetch(templateid);

    if (forceDelete || decouple) {
      const folderSvc = new Folder(this.org as Org);
      const folders = (await folderSvc.list()).filter(folder => folder.templateSourceId === templateid && folder.id);

      if (folders && folders.length > 0) {
        for (const folder of folders) {
          if (forceDelete) {
            await folderSvc.deleteFolder(folder.id);
            this.ux.log(messages.getMessage('deleteAppSuccess', [folder.label || folder.name, folder.id]));
          } else {
            await folderSvc.decouple(folder.id, templateid);
            this.ux.log(messages.getMessage('decoupleAppSuccess', [folder.label || folder.name, folder.id]));
          }
        }
      }
    }

    // Delete the template
    await wavetemplate.deleteTemplate(templateid);

    this.ux.log(messages.getMessage('deleteTemplateSuccess', [templateid]));
  }
}
