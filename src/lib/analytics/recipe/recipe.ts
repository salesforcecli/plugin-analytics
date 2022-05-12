/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, Org } from '@salesforce/core';
import { fetchAllPages } from '../request';

export type RecipeType = {
  id?: string;
  name?: string;
  namespace?: string;
  label?: string;
  status?: string;
};

export default class Recipe {
  private readonly connection: Connection;
  private readonly recipesUrl: string;

  public constructor(organization: Org) {
    this.connection = organization.getConnection();
    this.recipesUrl = `${this.connection.baseUrl()}/wave/recipes/`;
  }

  public list(): Promise<RecipeType[]> {
    return fetchAllPages<RecipeType>(this.connection, this.recipesUrl, 'recipes');
  }
}
