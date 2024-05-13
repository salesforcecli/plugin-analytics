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
import { generateTableColumns, headerColor } from '../../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class Display extends SfCommand<DataflowJobType> {
  public static readonly summary = messages.getMessage('displayCommandDescription');
  public static readonly description = messages.getMessage('displayCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:dataflow:job:display --dataflowjobid <dataflowjobid>'];

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
    const { flags } = await this.parse(Display);
    const dataflowjobId = flags.dataflowjobid;
    const dataflow = new Dataflow(flags['target-org'].getConnection(flags['api-version']));

    const dataflowJob = await dataflow.getDataflowJob(dataflowjobId);
    this.styledHeader(headerColor(messages.getMessage('displayDetailHeader')));
    this.table(
      [
        { key: 'Id', value: dataflowJob.id },
        { key: 'Label', value: dataflowJob.label },
        { key: 'Status', value: dataflowJob.status },
        { key: 'Wait Time', value: dataflowJob.waitTime },
        { key: 'Progress', value: dataflowJob.progress },
        { key: 'Retry Count', value: dataflowJob.retryCount },
        { key: 'Start Date', value: dataflowJob.startDate },
      ],
      generateTableColumns(['key', 'value'])
    );
    return dataflowJob;
  }
}
