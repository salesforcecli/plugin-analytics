/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Dataflow from '../../../lib/analytics/dataflow/dataflow';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class Start extends SfdxCommand {
  public static description = messages.getMessage('runCommandDescription');
  public static longDescription = messages.getMessage('runCommandLongDescription');

  public static examples = ['$ sfdx analytics:dataflow:start --dataflowid <dataflowid>'];

  protected static flagsConfig = {
    dataflowid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('dataflowidFlagDescription'),
      longDescription: messages.getMessage('dataflowidFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const dataflowId = this.flags.dataflowid as string;
    const dataflow = new Dataflow(this.org as Org);

    const dataflowJob = await dataflow.startDataflow(dataflowId);
    const message = messages.getMessage('dataflowsJobUpdate', [dataflowJob?.dataflow?.id, dataflowJob?.status]);
    this.ux.log(message);
    return dataflowJob;
  }
}
