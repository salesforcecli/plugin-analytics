/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Dataflow from '../../../lib/analytics/dataflow/dataflow';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class Stop extends SfdxCommand {
  public static description = messages.getMessage('stopCommandDescription');
  public static longDescription = messages.getMessage('stopCommandLongDescription');

  public static examples = ['$ sfdx analytics:dataflow:stop --dataflowjobid <dataflowjobid>'];

  protected static flagsConfig = {
    dataflowjobid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('dataflowjobIdFlagDescription'),
      longDescription: messages.getMessage('dataflowjobIdFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const dataflowjobId = this.flags.dataflowjobid as string;
    const dataflow = new Dataflow(this.org as Org);

    const dataflowJob = await dataflow.stopDataflow(dataflowjobId);
    const message = messages.getMessage('dataflowsJobUpdate', [dataflowjobId, dataflowJob?.status]);
    this.ux.log(message);
    return dataflowJob;
  }
}
