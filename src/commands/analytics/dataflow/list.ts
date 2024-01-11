/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Dataflow from '../../../lib/analytics/dataflow/dataflow.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataflow');

export default class List extends SfCommand<
  Array<{ dataflowid?: string; namespace?: string; name?: string; label?: string; type?: string }>
> {
  public static readonly summary = messages.getMessage('listCommandDescription');
  public static readonly description = messages.getMessage('listCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:dataflow:list'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
  };

  public async run() {
    const { flags } = await this.parse(List);
    const dataflowSvc = new Dataflow(flags.targetOrg);
    const dataflows = ((await dataflowSvc.list()) || []).map((dataflow) => ({
      dataflowid: dataflow.id,
      namespace: dataflow.namespace,
      name: dataflow.name,
      label: dataflow.label,
      type: dataflow.type,
    }));
    this.styledHeader(messages.getMessage('dataflowsFound', [dataflows.length]));
    this.table(dataflows, {
      dataflowid: { header: 'dataflowid' },
      namespace: { header: 'namespace' },
      name: { header: 'name' },
      label: { header: 'label' },
      type: { header: 'type' },
    });
    return dataflows;
  }
}
