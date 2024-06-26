/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  SfCommand,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Recipe, { type RecipeType } from '../../../lib/analytics/recipe/recipe.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'recipe');

export default class Start extends SfCommand<RecipeType | undefined> {
  public static readonly summary = messages.getMessage('startCommandDescription');
  public static readonly description = messages.getMessage('startCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:recipe:start --recipeid <recipeid>'];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    recipeid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('recipeidFlagDescription'),
      description: messages.getMessage('recipeidFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Start);
    const recipeId = flags.recipeid;
    const recipe = new Recipe(flags['target-org'].getConnection(flags['api-version']));

    const recipeJob = await recipe.startRecipe(recipeId);
    const message = messages.getMessage('recipeJobUpdate', [recipeJob?.id, recipeJob?.status]);
    this.log(message);
    return recipeJob;
  }
}
