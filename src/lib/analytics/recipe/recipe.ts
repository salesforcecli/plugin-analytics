/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, Org } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request.js';
import { throwError } from '../utils.js';

export type RecipeType = Record<string, unknown> & {
  conversionDetails: [];
  createdBy?: { id?: string; name?: string; profilePhotoUrl?: string };
  createdDate?: string;
  dataflowLastUpdate?: string;
  dataset?: { id?: string; name?: string; url?: string };
  fileUrl?: string;
  format?: string;
  historiesUrl?: string;
  id?: string;
  label?: string;
  lastModifiedBy?: { id?: string; name?: string; profilePhotoUrl?: string };
  lastModifiedDate?: string;
  licenseAttributes?: { type?: string };
  name?: string;
  namespace?: string;
  publishingTarget?: string;
  recipeDefinition?: { name?: string; nodes?: Record<string, unknown>; ui?: Record<string, unknown>; version?: string };
  scheduleAttributes?: { assetId: string; frequency: string };
  sourceRecipe?: string;
  status?: string;
  targetDataflowId?: string;
  type?: string;
  url?: string;
  validationDetails: [];
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
      url: targetDataflowIdUrl,
    });
    const dataflowId = recipeDetails.targetDataflowId;
    const response = await connectRequest<RecipeType>(this.connection, {
      method: 'POST',
      url: startRecipeUrl,
      body: JSON.stringify({
        dataflowId,
        command,
      }),
    });

    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }
}
