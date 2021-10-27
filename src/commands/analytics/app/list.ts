/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join } from 'path';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Folder from '../../../lib/analytics/app/folder';

Messages.importMessagesDirectory(join(__dirname, '..', '..', '..', '..'));
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listCommandDescription');
  public static longDescription = messages.getMessage('listCommandLongDescription');

  public static examples = ['$ sfdx analytics:app:list'];

  protected static flagsConfig = {
    folderid: flags.string({
      char: 'f',
      description: messages.getMessage('folderidFlagDescription'),
      longDescription: messages.getMessage('folderidFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['name', 'label', 'folderid', 'status', 'templateSourceId', 'namespace'];

  public async run() {
    const folderSvc = new Folder(this.org as Org);
    const folderid = this.flags.folderid as string;
    const folders = ((await folderSvc.list()) || [])
      .filter(folder => !folderid || folder.id === folderid)
      .map(folder => ({
        name: folder.name,
        label: folder.label,
        folderid: folder.id,
        status: folder.applicationStatus,
        templateSourceId: folder.templateSourceId !== null ? folder.templateSourceId : null,
        namespace: folder.namespace
      }));
    if (folders.length > 0) {
      this.ux.styledHeader(messages.getMessage('appsFound', [folders.length]));
    }
    return folders;
  }
}
