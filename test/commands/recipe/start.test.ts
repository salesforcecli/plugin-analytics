/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';
import { ensureJsonMap, JsonMap, ensureString } from '@salesforce/ts-types';
import { SfdxError } from '@salesforce/core';
import { RecipeType } from '../../../src/lib/analytics/recipe/recipe';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'recipe');

const recipeJson: RecipeType & JsonMap = {
  conversionDetails: [],
  createdBy: {
    id: '005T0000000mzGUIAY',
    name: 'Integration User',
    profilePhotoUrl: '/img/userprofile/default.png'
  },
  createdDate: '2020-02-21T17:48:58.000Z',
  dataflowLastUpdate: '2020-02-21T17:48:58.000Z',
  dataset: {
    id: '0FbB0000000DgmWKAS',
    name: 'ABCRecipe',
    url: '/services/data/v57.0/wave/datasets/0FbB0000000DgmWKAS'
  },
  fileUrl: '/services/data/v57.0/wave/recipes/05vB0000000CetYIAS/file',
  format: 'R3',
  historiesUrl: '/services/data/v57.0/wave/recipes/05vB0000000CetYIAS/histories',
  id: '05vB0000000CetYIAS',
  label: 'ABCRecipe',
  lastModifiedBy: {
    id: '005T0000000mzGUIAY',
    name: 'Integration User',
    profilePhotoUrl: '/img/userprofile/defaulV2.png'
  },
  lastModifiedDate: '2020-02-21T17:48:58.000Z',
  licenseAttributes: { type: 'einsteinanalytics' },
  name: 'ABCRecipe',
  publishingTarget: 'Dataset',
  scheduleAttributes: { assetId: '05vB0000000CetYIAS', frequency: 'none' },
  sourceRecipe: '05vB0000000CetYIAS',
  status: 'Failure',
  targetDataflowId: '02KB0000000rqCoMAI',
  type: 'recipe',
  url: '/services/data/v57.0/wave/recipes/05vB0000000CetYIAS?format=R3',
  validationDetails: []
};

const recipeId = '05vB0000000CetYIAS';
const dataflowJobId = '02KB0000000rqCoMAI';
const status = 'Queued';
describe('analytics:recipe:start', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.indexOf('/wave/recipes/') >= 0 && url.indexOf('?format=R3') >= 0) {
        return Promise.resolve(recipeJson);
      } else if (request.method === 'POST' && url.indexOf('/wave/dataflowjobs') >= 0) {
        return Promise.resolve({ id: dataflowJobId, status });
      }
      return Promise.reject(new SfdxError('Invalid recipe ID'));
    })
    .stdout()
    .command(['analytics:recipe:start', '--recipeid', recipeId])
    .it('runs analytics:recipe:start --recipeid 05vB0000000CetYIAS', ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('recipeJobUpdate', [dataflowJobId, status]));
    });
});
