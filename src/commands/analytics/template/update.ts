/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand, SfdxResult } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';

import Folder from '../../../lib/analytics/app/folder';
import WaveTemplate from '../../../lib/analytics/template/wavetemplate';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

export default class Update extends SfdxCommand {
  public static description = messages.getMessage('updateCommandDescription');
  public static longDescription = messages.getMessage('updateCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:template:update -t templateid -f folderid',
    '$ sfdx analytics:template:update -t templateid -f folderid -r "recipeid1, recipeid2"',
    '$ sfdx analytics:template:update -f templateid -f folderid -d "datatransformid1, datatransformid2"'
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
    }),
    folderid: flags.id({
      char: 'f',
      description: messages.getMessage('folderidFlagDescription'),
      longDescription: messages.getMessage('folderidFlagLongDescription')
    }),
    // recipeids only work in 238+, they are silently ignored on the server in 236-
    recipeids: flags.array({
      char: 'r',
      required: false,
      description: messages.getMessage('recipeidsFlagDescription'),
      longDescription: messages.getMessage('recipeidsFlagLongDescription')
    }),
    // datatransformids only work in 246+, they are silently ignored on the server in 244-
    datatransformids: flags.array({
      char: 'd',
      required: false,
      description: messages.getMessage('datatransformidsFlagDescription'),
      longDescription: messages.getMessage('datatransformidsFlagLongDescription')
    }),
    assetversion: flags.integer({
      char: 'v',
      description: messages.getMessage('assetVersionFlagDescription'),
      longDescription: messages.getMessage('assetVersionFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static result: SfdxResult = {
    tableColumnData: ['name', 'label', 'folderid'],
    display() {
      if (this.tableColumnData) {
        if (Array.isArray(this.data) && this.data.length) {
          this.ux.table(this.data, this.tableColumnData);
        }
      }
    }
  };

  public async run() {
    const templateInput = (this.flags.templateid ?? this.flags.templatename) as string;
    if (!templateInput) {
      throw new SfdxError(messages.getMessage('missingRequiredField'));
    }
    let folderid = this.flags.folderid as string | undefined;
    const assetversion = this.flags.assetversion as number | undefined;
    const recipeIds = this.flags.recipeids as string[] | undefined;
    const datatransformIds = this.flags.datatransformids as string[] | undefined;

    const template = new WaveTemplate(this.org as Org);

    // no folder id provided, first see if we can find in on the folderSource of the template
    if (!folderid) {
      const found = await template.fetch(templateInput);
      folderid = found?.folderSource?.id;
    }

    // template name provided and no folder id.  In this scenario there is no master app so folder id must be provided
    if (typeof this.flags.templatename === 'string' && folderid == null) {
      this.ux.log(messages.getMessage('errorNoFolderFound', [templateInput]));
      return;
    }

    // if we can't get the folder id from the folderSource, throw error and search for options to show in error message
    if (!folderid) {
      const folderSvc = new Folder(this.org as Org);
      // calling list first because PUT with a wrong id doens't fail correctly
      const folders = ((await folderSvc.list()) || [])
        .filter(folder => folder.templateSourceId === templateInput)
        .map(folder => ({
          name: folder.name,
          label: folder.label,
          folderid: folder.id
        }));

      if (folders.length) {
        this.ux.styledHeader(messages.getMessage('errorNoFolderFound', [templateInput]));
        this.ux.styledHeader(messages.getMessage('updateFolderIdNeeded2', [folders.length]));
        return folders;
      } else {
        this.ux.log(messages.getMessage('errorNoFolderFound', [templateInput]));
        return;
      }
    }
    const result = await template.update(folderid, templateInput, assetversion, recipeIds, datatransformIds);
    this.ux.log(messages.getMessage('updateSuccess', [result?.name, result?.id, folderid]));
    return templateInput;
  }
}
