/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, Org } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request';
import { throwError } from '../utils';

export type RecipeType = {
  id?: string;
  name?: string;
  namespace?: string;
  targetDataflowId?: string;
  type?: string;
  label?: string;
  status?: string;
};
export default class Recipe {
  private readonly connection: Connection;
  private readonly recipesUrl: string;
  private readonly dataflowsJobsUrl: string;

  public constructor(organization: Org) {
    this.connection = organization.getConnection();
    this.recipesUrl = `${this.connection.baseUrl()}/wave/recipes/`;
    this.dataflowsJobsUrl = `${this.connection.baseUrl()}/wave/dataflowjobs/`;
  }

  public list(): Promise<RecipeType[]> {
    return fetchAllPages<RecipeType>(this.connection, this.recipesUrl, 'recipes');
  }

  public async startRecipe(recipeId: string): Promise<RecipeType | undefined> {
    const startRecipeUrl = this.dataflowsJobsUrl;
    const targetDataflowIdUrl = this.recipesUrl + recipeId + '?format=R3';
    const command = 'start';

    const recipeDetails = await connectRequest<RecipeType>(this.connection, {
      method: 'GET',
      url: targetDataflowIdUrl
    });
    const dataflowId = recipeDetails.targetDataflowId;
    const response = await connectRequest<RecipeType>(this.connection, {
      method: 'POST',
      url: startRecipeUrl,
      body: JSON.stringify({
        dataflowId,
        command
      })
    });

    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }
}
