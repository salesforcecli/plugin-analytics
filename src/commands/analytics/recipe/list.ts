/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Recipe from '../../../lib/analytics/recipe/recipe';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'recipe');

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listCommandDescription');
  public static longDescription = messages.getMessage('listCommandLongDescription');

  public static examples = ['$ sfdx analytics:recipe:list'];

  protected static flagsConfig = {};

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['recipeid', 'name', 'namespace', 'label', 'status'];

  public async run() {
    const recipeSvc = new Recipe(this.org as Org);
    const recipes = ((await recipeSvc.list()) || []).map(recipe => ({
      recipeid: recipe.id,
      name: recipe.name,
      namespace: recipe.namespace,
      label: recipe.label,
      status: recipe.status
    }));
    if (recipes.length) {
      this.ux.styledHeader(messages.getMessage('recipesFound', [recipes.length]));
    }
    return recipes;
  }
}
