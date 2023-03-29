/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import AutoInstall from '../../../../lib/analytics/autoinstall/autoinstall';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

export default class Cancel extends SfdxCommand {
  public static description = messages.getMessage('cancelAutoinstallCommandDescription');
  public static longDescription = messages.getMessage('cancelAutoinstallCommandLongDescription');

  public static examples = ['$ sfdx analytics:autoinstall:app:cancel -i id'];

  protected static flagsConfig = {
    autoinstallid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('autoinstallidFlagDescription'),
      longDescription: messages.getMessage('autoinstallidFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const autoinstall = new AutoInstall(this.org as Org);
    await autoinstall.cancel(this.flags.autoinstallid as string);
    this.ux.log(messages.getMessage('appAutoInstallCancelRequestSuccess', [this.flags.autoinstallid]));
  }
}
