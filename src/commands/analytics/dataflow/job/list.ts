/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import Dataflow from '../../../../lib/analytics/dataflow/dataflow';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listJobsCommandDescription');
  public static longDescription = messages.getMessage('listJobsCommandLongDescription');

  public static examples = ['$ sfdx analytics:dataflow:job:list --dataflowid <dataflowid>'];

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

  protected static tableColumnData = ['id', 'label', 'status', 'waitTime', 'progress', 'retryCount', 'startDate'];

  public async run() {
    const dataflow = new Dataflow(this.org as Org);
    const dataflowJobs = ((await dataflow.getDataflowJobs(this.flags.dataflowid as string)) || []).map(job => ({
      id: job.id,
      label: job.label,
      status: job.status,
      waitTime: job.waitTime,
      progress: job.progress,
      retryCount: job.retryCount,
      startDate: job.startDate
    }));
    if (dataflowJobs.length) {
      this.ux.styledHeader(messages.getMessage('dataflowsFound', [dataflowJobs.length]));
    }
    return dataflowJobs;
  }
}
