/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { promises as fs } from 'fs';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import Dataflow from '../../../lib/analytics/dataflow/dataflow';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class Update extends SfdxCommand {
  public static description = messages.getMessage('updateCommandDescription');
  public static longDescription = messages.getMessage('updateCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:dataflow:update --dataflowid <dataflowid> --dataflowfile dataflow-file.json'
  ];

  protected static flagsConfig = {
    dataflowid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('dataflowidFlagDescription'),
      longDescription: messages.getMessage('dataflowidFlagLongDescription')
    }),
    dataflowfile: flags.filepath({
      char: 'f',
      description: messages.getMessage('dataflowFileFlagDescription'),
      longDescription: messages.getMessage('dataflowFileFlagLongDescription')
    }),
    dataflowstr: flags.string({
      char: 's',
      description: messages.getMessage('dataflowJsonFlagDescription'),
      longDescription: messages.getMessage('dataflowJsonFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const dataflowId = this.flags.dataflowid as string;
    const dataflow = new Dataflow(this.org as Org);

    let json: unknown;
    if (this.flags.dataflowfile) {
      const path = String(this.flags.dataflowfile);
      try {
        json = JSON.parse(await fs.readFile(path, 'utf8'));
      } catch (e) {
        throw new SfdxError(
          `Error parsing ${path}`,
          undefined,
          undefined,
          undefined,
          e instanceof Error ? e : new Error(e ? String(e) : '<unknown>')
        );
      }
    } else if (this.flags.dataflowstr) {
      json = JSON.parse(String(this.flags.dataflowstr));
    } else {
      throw new SfdxError(messages.getMessage('missingRequiredField'));
    }
    const dataflowResponse = await dataflow.updateDataflow(dataflowId, json);
    const message = messages.getMessage('updateDataflow', [dataflowResponse.name, dataflowId]);
    this.ux.log(message);
    return dataflowResponse;
  }
}
