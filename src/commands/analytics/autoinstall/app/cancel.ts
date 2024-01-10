/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import AutoInstall from '../../../../lib/analytics/autoinstall/autoinstall.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

export default class Cancel extends SfCommand<void> {
  public static readonly summary = messages.getMessage('cancelAutoinstallCommandDescription');
  public static readonly description = messages.getMessage('cancelAutoinstallCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:autoinstall:app:cancel -i id'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    autoinstallid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('autoinstallidFlagDescription'),
      description: messages.getMessage('autoinstallidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Cancel);
    const autoinstall = new AutoInstall(flags.targetOrg);
    await autoinstall.cancel(flags.autoinstallid);
    this.log(messages.getMessage('appAutoInstallCancelRequestSuccess', [flags.autoinstallid]));
  }
}
