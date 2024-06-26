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
import { Messages } from '@salesforce/core';

import Folder from '../../../lib/analytics/app/folder.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export default class Delete extends SfCommand<string> {
  public static readonly summary = messages.getMessage('deleteCommandDescription');
  public static readonly description = messages.getMessage('deleteCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:app:delete -f folderid'];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    folderid: Flags.salesforceId({
      char: 'f',
      required: true,
      summary: messages.getMessage('folderidFlagDescription'),
      description: messages.getMessage('folderidFlagLongDescription'),
    }),
    noprompt: Flags.boolean({
      char: 'p',
      summary: messages.getMessage('nopromptFlagDescription'),
      description: messages.getMessage('nopromptFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Delete);
    if (flags.noprompt || (await this.confirm({ message: messages.getMessage('confirmDeleteYesNo') }))) {
      const folder = new Folder(flags['target-org'].getConnection(flags['api-version']));
      await folder.deleteFolder(flags.folderid);
      this.log(messages.getMessage('deleteAppSuccess', [flags.folderid]));
    }
    return flags.folderid;
  }
}
