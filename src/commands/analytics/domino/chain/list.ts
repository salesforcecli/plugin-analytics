/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join } from 'path';
import { SfdxCommand, flags } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Domino from '../../../../lib/analytics/domino/domino';

Messages.importMessagesDirectory(join(__dirname, '..', '..', '..', '..'));
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export default class List extends SfdxCommand {
  public static description = 'Domino Chains';
  public static longDescription = 'Chain Chains';

  public static examples = ['$ sfdx analytics:domino:chain:list -n <variant_api_name>'];

  protected static flagsConfig = {
    variantname: flags.string({
      char: 'n',
      required: true,
      description: 'Variant api name',
      longDescription: 'Variant api name'
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['variant', 'chainid', 'name', 'label'];

  public async run() {
    const dominoSvc = new Domino(this.org as Org);
    const items = ((await dominoSvc.chainList(this.flags.variantname)) || []).map(item => ({
      label: item.label,
      chainid: item.id,
      variant: item.dominoVariant,
      name: item.name
    }));
    if (items.length > 0) {
      this.ux.styledHeader(messages.getMessage('appsFound', [items.length]));
    }
    return items;
  }
}
