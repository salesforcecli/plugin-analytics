/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import Dataflow, { type DataflowType } from '../../../lib/analytics/dataflow/dataflow.js';
import { fs } from '../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class Update extends SfCommand<DataflowType> {
  public static readonly summary = messages.getMessage('updateCommandDescription');
  public static readonly description = messages.getMessage('updateCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:dataflow:update --dataflowid <dataflowid> --dataflowfile dataflow-file.json',
  ];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    dataflowid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('dataflowidFlagDescription'),
      description: messages.getMessage('dataflowidFlagLongDescription'),
    }),
    dataflowfile: Flags.file({
      char: 'f',
      summary: messages.getMessage('dataflowFileFlagDescription'),
      description: messages.getMessage('dataflowFileFlagLongDescription'),
    }),
    dataflowstr: Flags.string({
      char: 's',
      summary: messages.getMessage('dataflowJsonFlagDescription'),
      description: messages.getMessage('dataflowJsonFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Update);
    const dataflowId = flags.dataflowid;
    const dataflow = new Dataflow(flags.targetOrg);

    let json: unknown;
    if (flags.dataflowfile) {
      const path = String(flags.dataflowfile);
      try {
        json = JSON.parse(await fs.readFile(path));
      } catch (e) {
        throw new SfError(
          `Error parsing ${path}`,
          undefined,
          undefined,
          undefined,
          e instanceof Error ? e : new Error(e ? String(e) : '<unknown>')
        );
      }
    } else if (flags.dataflowstr) {
      json = JSON.parse(String(flags.dataflowstr));
    } else {
      throw new SfError(messages.getMessage('missingRequiredField'));
    }
    const dataflowResponse = await dataflow.updateDataflow(dataflowId, json);
    const message = messages.getMessage('updateDataflow', [dataflowResponse.name, dataflowId]);
    this.log(message);
    return dataflowResponse;
  }
}
