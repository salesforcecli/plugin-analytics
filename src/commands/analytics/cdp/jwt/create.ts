/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import CdpAuth from '../../../../lib/analytics/auth/CdpAuth';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'cdp');

export default class Create extends SfdxCommand {
  public static description = messages.getMessage('jwtCommandDescription');
  public static longDescription = messages.getMessage('jwtCommandLongDescription');

  public static examples = ['$ sfdx analytics:cdp:jwt:create -d dataOrgInstance -i dataOrgId'];

  protected static flagsConfig = {
    dataorgid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('dataorgidFlagDescription'),
      longDescription: messages.getMessage('dataorgidFlagLongDescription')
    }),
    dataorginstance: flags.string({
      char: 'd',
      required: true,
      description: messages.getMessage('dataorginstanceFlagDescription'),
      longDescription: messages.getMessage('dataorginstanceFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const authSvc = new CdpAuth(this.org as Org);
    const results = await authSvc.create('Jwt', this.flags.dataorgid as string, this.flags.dataorginstance as string);
    this.ux.logJson(results);
    return results;
  }
}
