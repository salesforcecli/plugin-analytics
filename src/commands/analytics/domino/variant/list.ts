/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join } from 'path';
import { SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Domino from '../../../../lib/analytics/domino/domino';

Messages.importMessagesDirectory(join(__dirname, '..', '..', '..', '..'));
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

export default class List extends SfdxCommand {
  public static description = 'Chain Variants';
  public static longDescription = 'Chain Variants';

  public static examples = ['$ sfdx analytics:domino:variant:list'];

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['chainApiName', 'label', 'description'];

  public async run() {
    const dominoSvc = new Domino(this.org as Org);
    const items = ((await dominoSvc.variantList()) || [])
      .filter(() => true)
      .map(item => ({
        label: item.label,
        description: item.description,
        chainApiName: item.fullyQualifiedApiName
      }));
    if (items.length > 0) {
      this.ux.styledHeader(messages.getMessage('appsFound', [items.length]));
    }
    return items;
  }
}
