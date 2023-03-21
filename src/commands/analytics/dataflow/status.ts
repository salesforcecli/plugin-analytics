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

export default class Status extends SfdxCommand {
  public static description = messages.getMessage('statusCommandDescription');
  public static longDescription = messages.getMessage('statusCommandLongDescription');

  public static examples = ['$ sfdx analytics:dataflow:status --dataflowjobid <dataflowjobid>'];

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

    const dataflowJob = await dataflow.getDataflowJobStatus(dataflowjobId);
    const message = messages.getMessage('dataflowJobStatus', [
      dataflowJob?.id,
      dataflowJob?.label,
      dataflowJob?.status,
      dataflowJob?.progress,
      dataflowJob?.duration,
      dataflowJob?.retryCount,
      dataflowJob?.startDate,
      dataflowJob?.waitTime
    ]);
    this.ux.log(message);
    return dataflowJob;
  }
}
