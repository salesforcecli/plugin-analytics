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
const messages = Messages.loadMessages('@salesforce/analytics', 'dashboard');

export default class Establish extends SfdxCommand {
  public static description = messages.getMessage('updateCommandDescription');
  public static longDescription = messages.getMessage('updateCommandLongDescription');

  public static examples = ['$ sfdx analytics:cdp:setup:establish -d dataOrgInstance -a dataOrgId'];

  protected static flagsConfig = {
    dataorgalias: flags.string({
      char: 'a',
      required: true,
      description: 'test',
      longDescription: 'test'
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  // protected static tableColumnData = ['orgId', 'tenant'];

  public async run() {
    // Gather some information for the data org
    const dataOrg = await Org.create({ aliasOrUsername: this.flags.dataorgalias as string });
    const dataOrgId = dataOrg.getOrgId();
    const dataOrgUserName = dataOrg.getUsername() as string;
    // const dataOrgconn: Connection = dataOrg.getConnection();
    // const dataOrgAccessToken = dataOrgconn.accessToken;
    // eslint-disable-next-line no-console
    // console.log(dataOrgAccessToken);
    // eslint-disable-next-line no-console
    // console.log(dataOrgAccessToken);

    const cdpOrgauthSvc = new CdpAuth(this.org as Org);
    const dataOrgAuthSvc = new CdpAuth(dataOrg);

    const results = await cdpOrgauthSvc.create('Jwt', dataOrgId, 'na46');
    this.ux.log('CREATING JWT TOKEN CDP ORG');
    this.ux.logJson(results);
    const jwtToken = results?.token as unknown as string;

    const tenant = results?.tenant;

    // run command against data org
    this.ux.log('ESTABISHING TRUST WITH DATA ORG');

    const trustTesults = await dataOrgAuthSvc.establishTrust(
      'EstablishTrust',
      dataOrgUserName,
      '123456',
      tenant,
      jwtToken,
      undefined
    );

    this.ux.logJson(trustTesults);

    this.ux.log('CREATING OBJECTS CDP ORG');

    const createObjectsResults = await cdpOrgauthSvc.create('CreateObjects', dataOrgId, 'na46');
    this.ux.logJson(createObjectsResults);
    return results;
  }
}
