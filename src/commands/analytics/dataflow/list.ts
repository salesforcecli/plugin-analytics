/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Dataflow from '../../../lib/analytics/dataflow/dataflow';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listCommandDescription');
  public static longDescription = messages.getMessage('listCommandLongDescription');

  public static examples = ['$ sfdx analytics:dataflow:list'];

  protected static flagsConfig = {};

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['dataflowid', 'name', 'label', 'type', 'namespace'];

  public async run() {
    const dataflowSvc = new Dataflow(this.org as Org);
    const dataflows = ((await dataflowSvc.list()) || []).map(dataflow => ({
      dataflowid: dataflow.id,
      namespace: dataflow.namespace,
      name: dataflow.name,
      label: dataflow.label,
      type: dataflow.type
    }));
    if (dataflows.length) {
      this.ux.styledHeader(messages.getMessage('dataflowsFound', [dataflows.length]));
    }
    return dataflows;
  }
}
