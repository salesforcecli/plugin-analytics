/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  SfCommand,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Dataflow, { type DataflowJobType } from '../../../../lib/analytics/dataflow/dataflow.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class Stop extends SfCommand<DataflowJobType> {
  public static readonly summary = messages.getMessage('stopCommandDescription');
  public static readonly description = messages.getMessage('stopCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:dataflow:job:stop --dataflowjobid <dataflowjobid>'];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    dataflowjobid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('dataflowjobIdFlagDescription'),
      description: messages.getMessage('dataflowjobIdFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Stop);
    const dataflowjobId = flags.dataflowjobid;
    const dataflow = new Dataflow(flags['target-org'].getConnection(flags['api-version']));

    const dataflowJob = await dataflow.stopDataflowJob(dataflowjobId);
    const message = messages.getMessage('dataflowJobUpdate', [dataflowjobId, dataflowJob.status]);
    this.log(message);
    return dataflowJob;
  }
}
