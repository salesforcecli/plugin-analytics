/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import { blue } from 'chalk';
import Dataflow from '../../../../lib/analytics/dataflow/dataflow';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class Display extends SfdxCommand {
  public static description = messages.getMessage('displayCommandDescription');
  public static longDescription = messages.getMessage('displayCommandLongDescription');

  public static examples = ['$ sfdx analytics:dataflow:job:display --dataflowjobid <dataflowjobid>'];

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
    this.ux.styledHeader(blue(messages.getMessage('displayDetailHeader')));
    this.ux.table(
      [
        { key: 'Id', value: dataflowJob.id },
        { key: 'Label', value: dataflowJob.label },
        { key: 'Status', value: dataflowJob.status },
        { key: 'Wait Time', value: dataflowJob.waitTime },
        { key: 'Progress', value: dataflowJob.progress },
        { key: 'Retry Count', value: dataflowJob.retryCount },
        { key: 'Start Date', value: dataflowJob.startDate }
      ],
      {
        columns: [
          { key: 'key', label: 'Key' },
          { key: 'value', label: 'Value' }
        ]
      }
    );
    return dataflowJob;
  }
}
