/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import AutoInstall from '../../../lib/analytics/autoinstall/autoinstall.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

export default class List extends SfCommand<
  Array<{
    id?: string;
    requestType?: string;
    requestName?: string;
    requestStatus?: string;
    templateApiName?: string;
    folderId?: string;
    folderLabel?: string;
  }>
> {
  public static readonly summary = messages.getMessage('listCommandDescription');
  public static readonly description = messages.getMessage('listCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:autoinstall:list'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
  };

  public async run() {
    const { flags } = await this.parse(List);
    const autoinstall = new AutoInstall(flags.targetOrg);
    const autoinstalls = ((await autoinstall.list()) || []).map((request) => ({
      id: request.id,
      requestType: request.requestType,
      requestName: request.requestName,
      requestStatus: request.requestStatus,
      templateApiName: request.templateApiName,
      folderId: request.folderId,
      folderLabel: request.folderLabel,
    }));
    this.styledHeader(messages.getMessage('autoinstallsFound', [autoinstalls.length]));
    this.table(autoinstalls, {
      id: { header: 'id' },
      requestType: { header: 'requestType' },
      requestName: { header: 'requestName' },
      requestStatus: { header: 'requestStatus' },
      templateApiName: { header: 'templateApiName' },
      folderId: { header: 'folderId' },
      folderLabel: { header: 'folderLabel' },
    });
    return autoinstalls;
  }
}
