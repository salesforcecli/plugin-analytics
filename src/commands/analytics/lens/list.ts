/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Lens from '../../../lib/analytics/lens/lens';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'lens');

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listCommandDescription');
  public static longDescription = messages.getMessage('listCommandLongDescription');

  public static examples = ['$ sfdx analytics:lens:list'];

  protected static flagsConfig = {};

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['lensid', 'name', 'label', 'namespace'];

  public async run() {
    const lensSvc = new Lens(this.org as Org);
    const lenses = ((await lensSvc.list()) || []).map(lens => ({
      lensid: lens.id,
      name: lens.name,
      namespace: lens.namespace,
      label: lens.label
    }));
    if (lenses.length) {
      this.ux.styledHeader(messages.getMessage('lensesFound', [lenses.length]));
    }
    return lenses;
  }
}
