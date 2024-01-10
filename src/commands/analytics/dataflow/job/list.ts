/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import Dataflow from '../../../../lib/analytics/dataflow/dataflow.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class List extends SfCommand<
  Array<{
    id?: string;
    label?: string;
    status?: string;
    waitTime?: number;
    progress?: number;
    retryCount?: number;
    startDate?: string;
  }>
> {
  public static readonly summary = messages.getMessage('listJobsCommandDescription');
  public static readonly description = messages.getMessage('listJobsCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:dataflow:job:list --dataflowid <dataflowid>'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    dataflowid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('dataflowidFlagDescription'),
      description: messages.getMessage('dataflowidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(List);
    const dataflow = new Dataflow(flags.targetOrg);
    const dataflowJobs = ((await dataflow.getDataflowJobs(flags.dataflowid)) || []).map((job) => ({
      id: job.id,
      label: job.label,
      status: job.status,
      waitTime: job.waitTime,
      progress: job.progress,
      retryCount: job.retryCount,
      startDate: job.startDate,
    }));
    this.styledHeader(messages.getMessage('dataflowsFound', [dataflowJobs.length]));
    this.table(dataflowJobs, {
      id: { header: 'id' },
      label: { header: 'label' },
      status: { header: 'status' },
      waitTime: { header: 'waitTime' },
      progress: { header: 'progress' },
      retryCount: { header: 'retryCount' },
      startDate: { header: 'startDate' },
    });
    return dataflowJobs;
  }
}
