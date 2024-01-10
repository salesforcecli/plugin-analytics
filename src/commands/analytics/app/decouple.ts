/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Folder from '../../../lib/analytics/app/folder.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export default class Decouple extends SfCommand<string> {
  public static readonly summary = messages.getMessage('decoupleCommandDescription');
  public static readonly description = messages.getMessage('decoupleCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:app:decouple -f folderId -t templateId'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    folderid: Flags.salesforceId({
      char: 'f',
      required: true,
      summary: messages.getMessage('folderidFlagDescription'),
      description: messages.getMessage('folderidFlagLongDescription'),
    }),
    templateid: Flags.salesforceId({
      char: 't',
      required: true,
      summary: messages.getMessage('templateidFlagDescription'),
      description: messages.getMessage('templateidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Decouple);
    const folder = new Folder(flags.targetOrg);
    const folderId = await folder.decouple(flags.folderid, flags.templateid);
    this.log(messages.getMessage('decoupleSuccess', [folderId ?? flags.folderid, flags.templateid]));
    return folderId ?? flags.folderid;
  }
}
