/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import CdpAuth from '../../../lib/analytics/auth/CdpAuth';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'cdp');

export default class Auth extends SfdxCommand {
  public static description = messages.getMessage('listCommandDescription');
  public static longDescription = messages.getMessage('listCommandLongDescription');

  public static examples = ['$ sfdx analytics:cdp:auth'];

  protected static flagsConfig = {};

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const authSvc = new CdpAuth(this.org as Org);
    const authInfo = await authSvc.fetch();
    this.ux.logJson(authInfo);
    return authInfo;
  }
}
