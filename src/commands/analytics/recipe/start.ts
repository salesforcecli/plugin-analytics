/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Recipe from '../../../lib/analytics/recipe/recipe';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'recipe');

export default class Start extends SfdxCommand {
  public static description = messages.getMessage('startCommandDescription');
  public static longDescription = messages.getMessage('startCommandLongDescription');

  public static examples = ['$ sfdx analytics:recipe:start --recipeid <recipeid>'];

  protected static flagsConfig = {
    recipeid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('recipeidFlagDescription'),
      longDescription: messages.getMessage('recipeidFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const recipeId = this.flags.recipeid as string;
    const recipe = new Recipe(this.org as Org);

    const recipeJob = await recipe.startRecipe(recipeId);
    const message = messages.getMessage('recipeJobUpdate', [recipeJob?.id, recipeJob?.status]);
    this.ux.log(message);
    return recipeJob;
  }
}
