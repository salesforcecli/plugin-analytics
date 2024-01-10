/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Recipe from '../../../lib/analytics/recipe/recipe.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'recipe');

export default class List extends SfCommand<
  Array<{
    recipeid?: string;
    name?: string;
    namespace?: string;
    label?: string;
    status?: string;
  }>
> {
  public static readonly summary = messages.getMessage('listCommandDescription');
  public static readonly description = messages.getMessage('listCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:recipe:list'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
  };

  protected static tableColumnData = ['recipeid', 'name', 'namespace', 'label', 'status'];

  public async run() {
    const { flags } = await this.parse(List);
    const recipeSvc = new Recipe(flags.targetOrg);
    const recipes = ((await recipeSvc.list()) || []).map((recipe) => ({
      recipeid: recipe.id,
      name: recipe.name,
      namespace: recipe.namespace,
      label: recipe.label,
      status: recipe.status,
    }));
    this.styledHeader(messages.getMessage('recipesFound', [recipes.length]));
    this.table(recipes, {
      recipeid: { header: 'recipeid' },
      name: { header: 'name' },
      namespace: { header: 'namespace' },
      label: { header: 'label' },
      status: { header: 'status' },
    });

    return recipes;
  }
}
