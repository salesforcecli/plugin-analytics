/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Folder, { type AppStatus } from '../../../lib/analytics/app/folder.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export default class List extends SfCommand<
  Array<{
    name?: string;
    label?: string;
    folderid?: string;
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    status?: AppStatus | string;
    templateSourceId?: string;
    namespace?: string;
  }>
> {
  public static readonly summary = messages.getMessage('listCommandDescription');
  public static readonly description = messages.getMessage('listCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:app:list'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    folderid: Flags.string({
      char: 'f',
      summary: messages.getMessage('folderidFlagDescription'),
      description: messages.getMessage('folderidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(List);
    const folderSvc = new Folder(flags.targetOrg);
    const folderid = flags.folderid;
    const folders = ((await folderSvc.list()) || [])
      .filter((folder) => !folderid || folder.id === folderid)
      .map((folder) => ({
        name: folder.name,
        label: folder.label,
        folderid: folder.id,
        status: folder.applicationStatus,
        templateSourceId: folder.templateSourceId,
        namespace: folder.namespace,
      }));
    this.styledHeader(messages.getMessage('appsFound', [folders.length]));
    this.table(folders, {
      name: { header: 'name' },
      label: { header: 'label' },
      folderid: { header: 'folderid' },
      status: { header: 'status' },
      templateSourceId: { header: 'templateSourceId' },
      namespace: { header: 'namespace' },
    });
    return folders;
  }
}
