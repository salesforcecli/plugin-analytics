/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import AutoInstall from '../../../lib/analytics/autoinstall/autoinstall';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listCommandDescription');
  public static longDescription = messages.getMessage('listCommandLongDescription');

  public static examples = ['$ sfdx analytics:autoinstall:list'];

  protected static flagsConfig = {};

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = [
    'id',
    'requestType',
    'requestName',
    'requestStatus',
    'templateApiName',
    'folderId',
    'folderLabel'
  ];

  public async run() {
    const autoinstall = new AutoInstall(this.org as Org);
    const autoinstalls = ((await autoinstall.list()) || []).map(request => ({
      id: request.id,
      requestType: request.requestType,
      requestName: request.requestName,
      requestStatus: request.requestStatus,
      templateApiName: request.templateApiName,
      folderId: request.folderId,
      folderLabel: request.folderLabel
    }));
    if (autoinstalls.length) {
      this.ux.styledHeader(messages.getMessage('autoinstallsFound', [autoinstalls.length]));
    }
    return autoinstalls;
  }
}
