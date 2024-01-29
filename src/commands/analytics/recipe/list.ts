/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
  SfCommand,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Recipe from '../../../lib/analytics/recipe/recipe.js';
import { generateTableColumns } from '../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
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
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
  };

  public async run() {
    const { flags } = await this.parse(List);
    const recipeSvc = new Recipe(flags['target-org'].getConnection(flags['api-version']));
    const recipes = ((await recipeSvc.list()) || []).map((recipe) => ({
      recipeid: recipe.id,
      name: recipe.name,
      namespace: recipe.namespace,
      label: recipe.label,
      status: recipe.status,
    }));
    if (recipes.length > 0) {
      this.styledHeader(messages.getMessage('recipesFound', [recipes.length]));
      this.table(recipes, generateTableColumns(['recipeid', 'name', 'namespace', 'label', 'status']));
    } else {
      this.log(messages.getMessage('noResultsFound'));
    }

    return recipes;
  }
}
