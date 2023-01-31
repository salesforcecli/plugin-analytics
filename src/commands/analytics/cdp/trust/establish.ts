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

export default class Establish extends SfdxCommand {
  public static description = messages.getMessage('establishTrustCommandDescription');
  public static longDescription = messages.getMessage('establishTrustCommandLongDescription');

  public static examples = ['$ sfdx analytics:cdp:trust:establish -x username -p password -t tenant -k token'];

  protected static flagsConfig = {
    dataorgalias: flags.string({
      char: 'a',
      required: true,
      description: messages.getMessage('dataorgaliasFlagDescription'),
      longDescription: messages.getMessage('dataorgaliasFlagLongDescription')
    }),
    password: flags.string({
      char: 'p',
      required: true,
      description: 'test',
      longDescription: 'test'
    }),
    tenant: flags.string({
      char: 't',
      required: true,
      description: 'test',
      longDescription: 'test'
    }),
    token: flags.string({
      char: 'k',
      required: true,
      description: 'test',
      longDescription: 'test'
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  // protected static tableColumnData = ['orgId', 'tenant'];

  public async run() {
    const dataOrg = await Org.create({ aliasOrUsername: this.flags.dataorgalias as string });
    const dataOrgUsername = dataOrg.getUsername() as string;
    // eslint-disable-next-line no-console
    console.log(dataOrgUsername);
    // const authSvc = new CdpAuth(dataOrg);
    const cdpAuthSvc = new CdpAuth(this.org as Org);

    const results = await cdpAuthSvc.establishTrust(
      'EstablishTrust',
      this.org?.getUsername() as string,
      this.flags.password as string,
      this.flags.tenant as string,
      this.flags.token as string,
      ''
    );

    this.ux.logJson(results);
    return results;
  }
}
