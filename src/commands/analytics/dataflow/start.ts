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

import Dataflow, { type DataflowJobType } from '../../../lib/analytics/dataflow/dataflow.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class Start extends SfCommand<DataflowJobType> {
  public static readonly summary = messages.getMessage('startCommandDescription');
  public static readonly description = messages.getMessage('startCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:dataflow:start --dataflowid <dataflowid>'];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    dataflowid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('dataflowidFlagDescription'),
      description: messages.getMessage('dataflowidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Start);
    const dataflowId = flags.dataflowid;
    const dataflow = new Dataflow(flags['target-org'].getConnection(flags['api-version']));

    const dataflowJob = await dataflow.startDataflow(dataflowId);
    const message = messages.getMessage('dataflowJobUpdate', [dataflowJob.id, dataflowJob.status]);
    this.log(message);
    return dataflowJob;
  }
}
