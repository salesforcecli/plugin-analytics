/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// the test data is actual data from a server, which uses _ in field names
/* eslint-disable camelcase */

import { Messages, SfError } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import { AnyJson, JsonMap, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import Fetch from '../../../../src/commands/analytics/dataset/rows/fetch.js';
import { DatasetType } from '../../../../src/lib/analytics/dataset/dataset.js';
import { QueryResponse } from '../../../../src/lib/analytics/query/query.js';
import { getStderr, getStdout, stubDefaultOrg } from '../../../testutils.js';
import { xmdJson } from './fetch-xmd.js';
import { liveDatasetFieldsJson, liveDatasetJson, liveSqlResponseJson } from './live-dataset-json.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const queryMessages = Messages.loadMessages('@salesforce/analytics', 'query');

const datasetJson: DatasetType & JsonMap = {
  createdBy: {
    id: '005xx000001XCD7AAO',
    name: 'User User',
    profilePhotoUrl: '/profilephoto/005/T',
  },
  createdDate: '2021-01-20T20:07:19.000Z',
  currentVersionId: '0Fcxx0000004CsCCAU',
  currentVersionUrl: '/services/data/v52.0/wave/datasets/0Fbxx0000004CyeCAE/versions/0Fcxx0000004CsCCAU',
  dataRefreshDate: '2021-01-20T20:08:33.000Z',
  datasetType: 'default',
  folder: {
    id: '005xx000001XCD7AAO',
    label: 'User User',
  },
  id: '0Fbxx0000004CyeCAE',
  label: 'ABCWidgetSales2017',
  lastAccessedDate: '2021-03-06T17:50:17.000Z',
  lastModifiedBy: {
    id: '005xx000001XCGLAA4',
    name: 'Integration User',
    profilePhotoUrl: '/profilephoto/005/T',
  },
  lastModifiedDate: '2021-01-20T20:08:34.000Z',
  lastQueriedDate: '2021-03-06T03:18:57.000Z',
  name: 'ABCWidgetSales2017',
  permissions: {
    create: true,
    manage: true,
    modify: true,
    view: true,
  },
  type: 'dataset',
  url: '/services/data/v52.0/wave/datasets/0Fbxx0000004CyeCAE',
  userXmd: {},
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
                type: 'string',
              },
              inputs: [
                {
                  id: 'q.AVP',
                },
              ],
            },
            {
              field: {
                id: 'q.Adjusted_COGS',
                type: 'numeric',
              },
              inputs: [
                {
                  id: 'q.Adjusted_COGS',
                },
              ],
            },
            {
              field: {
                id: 'q.DIVISION_NUM',
                type: 'numeric',
              },
              inputs: [
                {
                  id: 'q.DIVISION_NUM',
                },
              ],
            },
            {
              field: {
                id: 'q.Division_Name',
                type: 'string',
              },
              inputs: [
                {
                  id: 'q.Division_Name',
                },
              ],
            },
            {
              field: {
                id: 'q.Location_Description',
                type: 'string',
              },
              inputs: [
                {
                  id: 'q.Location_Description',
                },
              ],
            },
            {
              field: {
                id: 'q.Location_Name',
                type: 'string',
              },
              inputs: [
                {
                  id: 'q.Location_Name',
                },
              ],
            },
            {
              field: {
                id: 'q.Online_Code',
                type: 'string',
              },
              inputs: [
                {
                  id: 'q.Online_Code',
                },
              ],
            },
            {
              field: {
                id: 'q.Regular_GM',
                type: 'numeric',
              },
              inputs: [
                {
                  id: 'q.Regular_GM',
                },
              ],
            },
            {
              field: {
                id: 'q.SVP',
                type: 'string',
              },
              inputs: [
                {
                  id: 'q.SVP',
                },
              ],
            },
            {
              field: {
                id: 'q.Sales',
                type: 'numeric',
              },
              inputs: [
                {
                  id: 'q.Sales',
                },
              ],
            },
            {
              field: {
                id: 'q.State',
                type: 'string',
              },
              inputs: [
                {
                  id: 'q.State',
                },
              ],
            },
            {
              field: {
                id: 'q.Total_GM',
                type: 'numeric',
              },
              inputs: [
                {
                  id: 'q.Total_GM',
                },
              ],
            },
            {
              field: {
                id: 'q.Year',
                type: 'string',
              },
              inputs: [
                {
                  id: 'q.Year',
                },
              ],
            },
          ],
        },
        queryLanguage: 'SAQL',
      },
    ],
    records: [
      {
        AVP: 'Bob Crowson',
        Adjusted_COGS: 772_506.99,
        DIVISION_NUM: 1,
        Division_Name: 'BCU',
        Location_Description: 'Billings MT Yard',
        Location_Name: 'ABC - BILLINGS, #409',
        Online_Code: 'BILLMTYD',
        Regular_GM: 210_685.9,
        SVP: 'Debra Kesner',
        Sales: 983_192.89,
        State: 'MT',
        Total_GM: 210_685.9,
        Year: '1/1/17',
      },
    ],
  },
  query:
    "q = load \"0Fbxx0000004CyeCAE/0Fcxx0000004CsCCAU\"; q = foreach q generate 'AVP' as 'AVP','Adjusted_COGS' as 'Adjusted_COGS','DIVISION_NUM' as 'DIVISION_NUM','Division_Name' as 'Division_Name','Location_Description' as 'Location_Description','Location_Name' as 'Location_Name','Online_Code' as 'Online_Code','Regular_GM' as 'Regular_GM','SVP' as 'SVP','Sales' as 'Sales','State' as 'State','Total_GM' as 'Total_GM','Year' as 'Year';",
  responseTime: 119,
};

describe('analytics:dataset:rows:fetch', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  // test regular dataset and xmd
  it(`runs: -i ${datasetJson.id}`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.includes('/wave/datasets/')) {
        if (url.includes('/xmds/main')) {
          return Promise.resolve(xmdJson);
        } else {
          return Promise.resolve(datasetJson);
        }
      } else if (request.method === 'POST' && url.includes('/wave/query')) {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Fetch.run(['-i', datasetJson.id!]);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
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
      'Year',
    ];
    const headerRegex = fieldNames.reduce((r, name, i) => {
      if (i !== 0) {
        r += '\\s+';
      }
      r += name;
      return r;
    }, '');
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.match(new RegExp(headerRegex));
    fieldNames.forEach((name, i) => {
      const value = saqlResponse.results.records[0][name];
      const regex = i !== 0 ? `\\s+${value}` : `${value}\\s+`;
      expect(stdout, 'stdout').to.match(new RegExp(regex));
    });
    expect(stdout, 'stdout').to.contain(queryMessages.getMessage('rowsFound', [saqlResponse.results.records.length]));
    expect(requestBody, 'post request body').to.deep.equal({
      query: saqlResponse.query,
    });
  });

  // test live dataset
  it(`runs: --limit 1000 -n ${liveDatasetJson.name}`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
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
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve(liveSqlResponseJson);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Fetch.run(['--limit', '1000', '-n', liveDatasetJson.name!]);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    const fieldNames = liveDatasetFieldsJson.fields.map((f) => f.name);
    const headerRegex = fieldNames.reduce((r, name, i) => {
      if (i !== 0) {
        r += '\\s+';
      }
      r += name;
      return r;
    }, '');
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.match(new RegExp(headerRegex));
    liveSqlResponseJson.records.forEach((record) => {
      fieldNames.forEach((name, i) => {
        const value = record[name];
        const regex = i !== 0 ? `\\s+${value}` : `${value}\\s+`;
        expect(stdout, 'stdout').to.match(new RegExp(regex));
      });
    });
    expect(stdout, 'stdout').to.contain(queryMessages.getMessage('rowsFound', [liveSqlResponseJson.records.length]));
    expect(ensureJsonMap(requestBody).query, 'post request body query').to.match(
      /^SELECT "YEAR_MONTH" AS "YEAR_MONTH",.+FROM "AIRLINE_DELAYS" LIMIT 1000$/
    );
  });

  // test the --limit 0 special case
  it(`runs: -n ${datasetJson.name} --limit 0`, async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (request.method === 'GET' && url.includes('/wave/datasets/')) {
        if (url.includes('/xmds/main')) {
          return Promise.resolve(xmdJson);
        } else {
          return Promise.resolve(datasetJson);
        }
      } else if (request.method === 'POST' && url.includes('/wave/query')) {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Fetch.run(['-n', datasetJson.name!, '--limit', '0']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(queryMessages.getMessage('rowsFound', [0]));
    expect(requestBody, 'post request body').to.deep.equal({
      query: saqlResponse.query + ' q = limit q 1;',
    });
  });
});
