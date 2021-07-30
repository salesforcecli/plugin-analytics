/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// the test data is actual data from a server, which uses _ in field names
/* eslint-disable camelcase */

import { core } from '@salesforce/command';
import { expect, test } from '@salesforce/command/lib/test';
import { SfdxError } from '@salesforce/core';
import { AnyJson, JsonMap, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import { DatasetType } from '../../../../src/lib/analytics/dataset/dataset';
import { QueryResponse } from '../../../../src/lib/analytics/query/query';
import { xmdJson } from './fetch-xmd';
import { liveDatasetFieldsJson, liveDatasetJson, liveSqlResponseJson } from './live-dataset-json';

core.Messages.importMessagesDirectory(__dirname);
const queryMessages = core.Messages.loadMessages('@salesforce/analytics', 'query');

const datasetJson: DatasetType & JsonMap = {
  createdBy: {
    id: '005xx000001XCD7AAO',
    name: 'User User',
    profilePhotoUrl: '/profilephoto/005/T'
  },
  createdDate: '2021-01-20T20:07:19.000Z',
  currentVersionId: '0Fcxx0000004CsCCAU',
  currentVersionUrl: '/services/data/v52.0/wave/datasets/0Fbxx0000004CyeCAE/versions/0Fcxx0000004CsCCAU',
  dataRefreshDate: '2021-01-20T20:08:33.000Z',
  datasetType: 'default',
  folder: {
    id: '005xx000001XCD7AAO',
    label: 'User User'
  },
  id: '0Fbxx0000004CyeCAE',
  label: 'ABCWidgetSales2017',
  lastAccessedDate: '2021-03-06T17:50:17.000Z',
  lastModifiedBy: {
    id: '005xx000001XCGLAA4',
    name: 'Integration User',
    profilePhotoUrl: '/profilephoto/005/T'
  },
  lastModifiedDate: '2021-01-20T20:08:34.000Z',
  lastQueriedDate: '2021-03-06T03:18:57.000Z',
  name: 'ABCWidgetSales2017',
  permissions: {
    create: true,
    manage: true,
    modify: true,
    view: true
  },
  type: 'dataset',
  url: '/services/data/v52.0/wave/datasets/0Fbxx0000004CyeCAE',
  userXmd: {}
};

const saqlResponse: QueryResponse & JsonMap = {
  action: 'query',
  responseId: '4ahfBTzzS_GBEG1Jiz9TyV',
  results: {
    metadata: [
      {
        lineage: {
          type: 'foreach',
          projections: [
            {
              field: {
                id: 'q.AVP',
                type: 'string'
              },
              inputs: [
                {
                  id: 'q.AVP'
                }
              ]
            },
            {
              field: {
                id: 'q.Adjusted_COGS',
                type: 'numeric'
              },
              inputs: [
                {
                  id: 'q.Adjusted_COGS'
                }
              ]
            },
            {
              field: {
                id: 'q.DIVISION_NUM',
                type: 'numeric'
              },
              inputs: [
                {
                  id: 'q.DIVISION_NUM'
                }
              ]
            },
            {
              field: {
                id: 'q.Division_Name',
                type: 'string'
              },
              inputs: [
                {
                  id: 'q.Division_Name'
                }
              ]
            },
            {
              field: {
                id: 'q.Location_Description',
                type: 'string'
              },
              inputs: [
                {
                  id: 'q.Location_Description'
                }
              ]
            },
            {
              field: {
                id: 'q.Location_Name',
                type: 'string'
              },
              inputs: [
                {
                  id: 'q.Location_Name'
                }
              ]
            },
            {
              field: {
                id: 'q.Online_Code',
                type: 'string'
              },
              inputs: [
                {
                  id: 'q.Online_Code'
                }
              ]
            },
            {
              field: {
                id: 'q.Regular_GM',
                type: 'numeric'
              },
              inputs: [
                {
                  id: 'q.Regular_GM'
                }
              ]
            },
            {
              field: {
                id: 'q.SVP',
                type: 'string'
              },
              inputs: [
                {
                  id: 'q.SVP'
                }
              ]
            },
            {
              field: {
                id: 'q.Sales',
                type: 'numeric'
              },
              inputs: [
                {
                  id: 'q.Sales'
                }
              ]
            },
            {
              field: {
                id: 'q.State',
                type: 'string'
              },
              inputs: [
                {
                  id: 'q.State'
                }
              ]
            },
            {
              field: {
                id: 'q.Total_GM',
                type: 'numeric'
              },
              inputs: [
                {
                  id: 'q.Total_GM'
                }
              ]
            },
            {
              field: {
                id: 'q.Year',
                type: 'string'
              },
              inputs: [
                {
                  id: 'q.Year'
                }
              ]
            }
          ]
        },
        queryLanguage: 'SAQL'
      }
    ],
    records: [
      {
        AVP: 'Bob Crowson',
        Adjusted_COGS: 772506.99,
        DIVISION_NUM: 1,
        Division_Name: 'BCU',
        Location_Description: 'Billings MT Yard',
        Location_Name: 'ABC - BILLINGS, #409',
        Online_Code: 'BILLMTYD',
        Regular_GM: 210685.9,
        SVP: 'Debra Kesner',
        Sales: 983192.89,
        State: 'MT',
        Total_GM: 210685.9,
        Year: '1/1/17'
      }
    ]
  },
  query:
    "q = load \"0Fbxx0000004CyeCAE/0Fcxx0000004CsCCAU\"; q = foreach q generate 'AVP' as 'AVP','Adjusted_COGS' as 'Adjusted_COGS','DIVISION_NUM' as 'DIVISION_NUM','Division_Name' as 'Division_Name','Location_Description' as 'Location_Description','Location_Name' as 'Location_Name','Online_Code' as 'Online_Code','Regular_GM' as 'Regular_GM','SVP' as 'SVP','Sales' as 'Sales','State' as 'State','Total_GM' as 'Total_GM','Year' as 'Year';",
  responseTime: 119
};

describe('analytics:dataset:rows:fetch', () => {
  let requestBody: AnyJson | undefined;
  function saveOffRequestBody(json: string | undefined) {
    requestBody = undefined;
    try {
      requestBody = json && (JSON.parse(json) as AnyJson);
    } catch (e) {
      expect.fail('Error parsing request body: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  beforeEach(() => {
    requestBody = undefined;
  });

  // test regular dataset and xmd
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.indexOf('/wave/datasets/') >= 0) {
        if (url.indexOf('/xmds/main') >= 0) {
          return Promise.resolve(xmdJson);
        } else {
          return Promise.resolve(datasetJson);
        }
      } else if (request.method === 'POST' && url.indexOf('/wave/query') >= 0) {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:dataset:rows:fetch', '-i', datasetJson.id as string])
    .it(`runs analytics:dataset:rows:fetch -i ${datasetJson.id}`, ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      const fieldNames = [
        'AVP',
        'Adjusted_COGS',
        'DIVISION_NUM',
        'Division_Name',
        'Location_Description',
        'Location_Name',
        'Online_Code',
        'Regular_GM',
        'SVP',
        'Sales',
        'State',
        'Total_GM',
        'Year'
      ];
      const headerRegex = fieldNames.reduce((r, name, i) => {
        if (i !== 0) {
          r += '\\s+';
        }
        r += name;
        return r;
      }, '');
      expect(ctx.stdout, 'stdout').to.match(new RegExp(headerRegex));
      fieldNames.forEach((name, i) => {
        const value = saqlResponse.results.records[0][name];
        const regex = i !== 0 ? `\\s+${value}` : `${value}\\s+`;
        expect(ctx.stdout, 'stdout').to.match(new RegExp(regex));
      });
      expect(ctx.stdout, 'stdout').to.contain(
        queryMessages.getMessage('rowsFound', [saqlResponse.results.records.length])
      );
      expect(requestBody, 'post request body').to.deep.equal({
        query: saqlResponse.query
      });
    });

  // test live dataset
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.endsWith('/wave/datasets/AIRLINE_DELAYS')) {
        return Promise.resolve(liveDatasetJson);
      } else if (
        request.method === 'GET' &&
        url.endsWith('/wave/dataConnectors/SnowflakeOne/sourceObjects/AIRLINE_DELAYS/fields')
      ) {
        return Promise.resolve(liveDatasetFieldsJson);
      } else if (request.method === 'POST' && url.endsWith('/wave/dataConnectors/SnowflakeOne/query')) {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(liveSqlResponseJson);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:dataset:rows:fetch', '--limit', '1000', '-n', liveDatasetJson.name as string])
    .it(`runs analytics:dataset:rows:fetch --limit 1000 -n ${liveDatasetJson.name}`, ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      const fieldNames = liveDatasetFieldsJson.fields.map(f => f.name);
      const headerRegex = fieldNames.reduce((r, name, i) => {
        if (i !== 0) {
          r += '\\s+';
        }
        r += name;
        return r;
      }, '');
      expect(ctx.stdout, 'stdout').to.match(new RegExp(headerRegex));
      liveSqlResponseJson.records.forEach(record => {
        fieldNames.forEach((name, i) => {
          const value = record[name];
          const regex = i !== 0 ? `\\s+${value}` : `${value}\\s+`;
          expect(ctx.stdout, 'stdout').to.match(new RegExp(regex));
        });
      });
      expect(ctx.stdout, 'stdout').to.contain(
        queryMessages.getMessage('rowsFound', [liveSqlResponseJson.records.length])
      );
      expect(ensureJsonMap(requestBody).query, 'post request body query').to.match(
        /^SELECT "YEAR_MONTH" AS "YEAR_MONTH",.+FROM "AIRLINE_DELAYS" LIMIT 1000$/
      );
    });

  // test the --limit 0 special case
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.indexOf('/wave/datasets/') >= 0) {
        if (url.indexOf('/xmds/main') >= 0) {
          return Promise.resolve(xmdJson);
        } else {
          return Promise.resolve(datasetJson);
        }
      } else if (request.method === 'POST' && url.indexOf('/wave/query') >= 0) {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:dataset:rows:fetch', '-n', datasetJson.name as string, '--limit', '0'])
    .it(`runs analytics:dataset:rows:fetch -n ${datasetJson.name} --limit 0`, ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.contain(queryMessages.getMessage('rowsFound', [0]));
      expect(requestBody, 'post request body').to.deep.equal({
        query: saqlResponse.query + ' q = limit q 1;'
      });
    });
});
