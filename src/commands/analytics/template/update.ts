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
import { Messages, SfError } from '@salesforce/core';

import Folder from '../../../lib/analytics/app/folder.js';
import WaveTemplate from '../../../lib/analytics/template/wavetemplate.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

export default class Update extends SfCommand<
  Array<{ name?: string; label?: string; folderid: string }> | string | undefined
> {
  public static readonly summary = messages.getMessage('updateCommandDescription');
  public static readonly description = messages.getMessage('updateCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:template:update -t templateid -f folderid',
    '$ sfdx analytics:template:update -t templateid -f folderid -r "recipeid1, recipeid2"',
    '$ sfdx analytics:template:update -f templateid -f folderid -d "datatransformid1, datatransformid2"',
  ];

  public static readonly flags = {
    loglevel,
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
    folderid: Flags.salesforceId({
      char: 'f',
      summary: messages.getMessage('folderidFlagDescription'),
      description: messages.getMessage('folderidFlagLongDescription'),
    }),
    // recipeids only work in 238+, they are silently ignored on the server in 236-
    recipeids: Flags.salesforceId({
      char: 'r',
      required: false,
      multiple: true,
      delimiter: ',',
      summary: messages.getMessage('recipeidsFlagDescription'),
      description: messages.getMessage('recipeidsFlagLongDescription'),
    }),
    // datatransformids only work in 246+, they are silently ignored on the server in 244-
    datatransformids: Flags.salesforceId({
      char: 'd',
      required: false,
      multiple: true,
      delimiter: ',',
      summary: messages.getMessage('datatransformidsFlagDescription'),
      description: messages.getMessage('datatransformidsFlagLongDescription'),
    }),
    assetversion: Flags.integer({
      char: 'v',
      summary: messages.getMessage('assetVersionFlagDescription'),
      description: messages.getMessage('assetVersionFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Update);
    const templateInput = (flags.templateid ?? flags.templatename) as string;
    if (!templateInput) {
      throw new SfError(messages.getMessage('missingRequiredField'));
    }
    let folderid = flags.folderid;
    const assetversion = flags.assetversion;
    const recipeIds = flags.recipeids;
    const datatransformIds = flags.datatransformids;

    const template = new WaveTemplate(flags['target-org'].getConnection(flags['api-version']));

    // no folder id provided, first see if we can find in on the folderSource of the template
    if (!folderid) {
      const found = await template.fetch(templateInput);
      folderid = found?.folderSource?.id;
    }

    // template name provided and no folder id.  In this scenario there is no master app so folder id must be provided
    if (typeof flags.templatename === 'string' && folderid == null) {
      this.log(messages.getMessage('errorNoFolderFound', [templateInput]));
      return;
    }

    // if we can't get the folder id from the folderSource, throw error and search for options to show in error message
    if (!folderid) {
      const folderSvc = new Folder(flags['target-org'].getConnection(flags['api-version']));
      // calling list first because PUT with a wrong id doens't fail correctly
      const folders = ((await folderSvc.list()) || [])
        .filter((folder) => folder.templateSourceId === templateInput)
        .map((folder) => ({
          name: folder.name,
          label: folder.label,
          folderid: folder.id,
        }));

      if (folders.length) {
        this.styledHeader(messages.getMessage('errorNoFolderFound', [templateInput]));
        this.styledHeader(messages.getMessage('updateFolderIdNeeded2', [folders.length]));
        return folders;
      } else {
        this.log(messages.getMessage('errorNoFolderFound', [templateInput]));
        return;
      }
    }
    const result = await template.update(folderid, templateInput, assetversion, recipeIds, datatransformIds);
    this.log(messages.getMessage('updateSuccess', [result?.name, result?.id, folderid]));
    return templateInput;
  }
}
