/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// our test data is real data from a server, which uses _'s in the field names
/* eslint-disable camelcase */

import { Messages, SfError } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { stubMethod } from '@salesforce/ts-sinon';
import { AnyJson, JsonMap, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import { expect } from 'chai';
import Query from '../../src/commands/analytics/query.js';
import { fs } from '../../src/lib/analytics/utils.js';
import { QueryResponse, SaqlMetadata, SqlLiveMetadata } from '../../src/lib/analytics/query/query.js';
import {
  expectToHaveElementInclude,
  getJsonOutput,
  getStderr,
  getStdout,
  getStyledHeaders,
  getStyledJSON,
  getTableData,
  stubDefaultOrg,
} from '../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'query');

const emptyResponse: QueryResponse & JsonMap = {
  action: 'query',
  responseId: '4a6ap-I-zOFSl-F8RxRwJ-',
  results: {
    metadata: [],
    records: [],
  },
  query: '',
  responseTime: 0,
};

const saqlMetadata: SaqlMetadata & JsonMap = {
  lineage: {
    type: 'foreach',
    projections: [
      {
        field: {
          id: 'q.Role Name',
          type: 'string',
        },
        inputs: [
          {
            id: 'q.Role.Name',
          },
        ],
      },
      {
        field: {
          id: 'q.Count',
          type: 'numeric',
        },
      },
    ],
    input: {
      type: 'group',
      groups: [
        {
          id: 'q.Role.Name',
        },
      ],
    },
  },
  queryLanguage: 'SAQL',
};

const noRowsResponse: QueryResponse & JsonMap = {
  action: 'query',
  responseId: '4a6ap-I-zOFSl-F8RxRwJ-',
  results: {
    metadata: [saqlMetadata],
    records: [],
  },
  query: '',
  responseTime: 0,
};

const saqlResponse: QueryResponse & JsonMap = {
  action: 'query',
  responseId: '4a6ap-I-zOFSl-F8RxRwJ-',
  results: {
    metadata: [saqlMetadata],
    records: [
      {
        Count: 1,
        'Role Name': 'CEO',
      },
      {
        Count: 1,
        'Role Name': 'CIO',
      },
      {
        Count: 5,
        'Role Name': 'Sales AMER',
      },
      {
        Count: 6,
        'Role Name': 'Sales EMEA',
      },
      {
        Count: 6,
        'Role Name': 'Sales WW',
      },
    ],
  },
  query:
    "q = load \"0Fb6g000000QI3fCAG/0Fc6g000007NGrnCAG\";\nq = group q by 'Role.Name';\nq = foreach q generate 'Role.Name' as 'Role Name', count() as 'Count';\nq = order q by 'Role Name' asc;\nq = limit q 2000;",
  responseTime: 55,
};

// records that contain double quotes, commas, and newlines in the values, to make sure that works with -r csv
const saqlResponse2: QueryResponse & JsonMap = {
  action: 'query',
  responseId: '4a6ap-I-zOFSl-F8RxRwJ-',
  results: {
    metadata: [saqlMetadata],
    records: [
      {
        Count: 1,
        'Role Name': 'CEO, "part-time"',
      },
      {
        Count: 1,
        'Role Name': '"CIO"',
      },
      {
        Count: 5,
        'Role Name': 'Sales\nAMER',
      },
    ],
  },
  query:
    "q = load \"0Fb6g000000QI3fCAG/0Fc6g000007NGrnCAG\";\nq = group q by 'Role.Name';\nq = foreach q generate 'Role.Name' as 'Role Name', count() as 'Count';\nq = order q by 'Role Name' asc;\nq = limit q 2000;",
  responseTime: 55,
};

const sqlResponse: QueryResponse & JsonMap = {
  action: 'query',
  responseId: '4aQJz1NrBjKm4G1Jiz9TyV',
  results: {
    metadata: [
      {
        columns: [
          {
            columnLabel: 'Division_Name',
            columnType: 'varchar',
          },
          {
            columnLabel: 'Location_Description',
            columnType: 'varchar',
          },
        ],
        queryLanguage: 'SQL',
      },
    ],
    records: [
      {
        Division_Name: 'ABC',
        Location_Description: 'Bunnell FL Yard',
      },
      {
        Division_Name: 'ABC',
        Location_Description: 'Sanford FL Yard',
      },
      {
        Division_Name: 'ABC',
        Location_Description: 'Groveland FL Yard',
      },
      {
        Division_Name: 'ABC',
        Location_Description: 'Pooler GA Yard',
      },
      {
        Division_Name: 'PRE',
        Location_Description: 'Tallahassee FL Yard',
      },
    ],
  },
  query: 'SELECT Division_Name, Location_Description FROM "ABCWidgetSales2017" ORDER BY Division_Name LIMIT 10',
  responseTime: 45,
};

const liveSqlResponse: QueryResponse & JsonMap = {
  metadata: {
    columns: [
      {
        label: 'CARRIER_NAME',
        type: 'varchar',
      },
      {
        label: 'AIRPORT_NAME',
        type: 'varchar',
      },
      {
        label: 'FLIGHTS',
        type: 'numeric',
      },
      {
        label: 'DELAYS',
        type: 'numeric',
      },
      {
        label: 'PCT_DELAYED',
        type: 'numeric',
      },
      {
        label: 'CARRIER_CT',
        type: 'numeric',
      },
      {
        label: 'PCT_DELAYED_CARRIER',
        type: 'numeric',
      },
    ],
    queryLanguage: 'SQL',
  },
  records: [
    {
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Albuquerque  NM: Albuquerque International Sunport',
      FLIGHTS: 246,
      DELAYS: 26,
      PCT_DELAYED: 0.105_691_057,
      CARRIER_CT: 10.93,
      PCT_DELAYED_CARRIER: 0.420_384_615,
    },
    {
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Atlanta  GA: Hartsfield-Jackson Atlanta International',
      FLIGHTS: 488,
      DELAYS: 69,
      PCT_DELAYED: 0.141_393_443,
      CARRIER_CT: 35.13,
      PCT_DELAYED_CARRIER: 0.509_130_435,
    },
    {
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Austin  TX: Austin - Bergstrom International',
      FLIGHTS: 580,
      DELAYS: 102,
      PCT_DELAYED: 0.175_862_069,
      CARRIER_CT: 43.99,
      PCT_DELAYED_CARRIER: 0.431_274_51,
    },
    {
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Hartford  CT: Bradley International',
      FLIGHTS: 155,
      DELAYS: 37,
      PCT_DELAYED: 0.238_709_677,
      CARRIER_CT: 19.38,
      PCT_DELAYED_CARRIER: 0.523_783_784,
    },
    {
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Birmingham  AL: Birmingham-Shuttlesworth International',
      FLIGHTS: 88,
      DELAYS: 19,
      PCT_DELAYED: 0.215_909_091,
      CARRIER_CT: 6.52,
      PCT_DELAYED_CARRIER: 0.343_157_895,
    },
  ],
};

describe('analytics:query', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  // test saql query
  it('runs: -q foo --nomapnames', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/query') && request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Query.run(['-q', 'foo', '--nomapnames']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    const { data, headers } = getTableData(sfCommandStubs);
    expect(headers, 'headers').to.deep.equal(['Role Name', 'Count']);
    expectToHaveElementInclude(data, { 'Role Name': 'CEO', Count: 1 }, 'table');
    expectToHaveElementInclude(data, { 'Role Name': 'CIO', Count: 1 }, 'table');
    expectToHaveElementInclude(data, { 'Role Name': 'Sales AMER', Count: 5 }, 'table');
    expectToHaveElementInclude(data, { 'Role Name': 'Sales EMEA', Count: 6 }, 'table');
    expectToHaveElementInclude(data, { 'Role Name': 'Sales WW', Count: 6 }, 'table');
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(
      messages.getMessage('rowsFound', [saqlResponse.results.records.length])
    );
    expect(requestBody, 'post request body').to.deep.equal({
      query: 'foo',
      queryLanguage: 'Saql',
    });
  });

  // test sql in a file
  it('runs: -f query.sql', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/query') && request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve(sqlResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };
    stubMethod($$.SANDBOX, fs, 'readFile').resolves(sqlResponse.query);

    await Query.run(['-f', 'query.sql']);

    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    const { data, headers } = getTableData(sfCommandStubs);
    expect(headers, 'headers').to.deep.equal(['Division_Name', 'Location_Description']);
    expectToHaveElementInclude(data, { Division_Name: 'ABC', Location_Description: 'Bunnell FL Yard' }, 'table');
    expectToHaveElementInclude(data, { Division_Name: 'PRE', Location_Description: 'Tallahassee FL Yard' }, 'table');
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(
      messages.getMessage('rowsFound', [sqlResponse.results.records.length])
    );
    expect(requestBody, 'post request body').to.deep.equal({
      query: sqlResponse.query,
      queryLanguage: 'Sql',
    });
  });

  // test saql with dataset name mapping
  it('runs: -f query.saql', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (url.includes('/wave/datasets/') && request.method === 'GET') {
        return Promise.resolve({
          id: '0Fb6g000000QI3fCAG',
          currentVersionId: '0Fb6g000000QI3fCAG',
        });
      } else if (url.includes('/wave/query') && request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };
    stubMethod($$.SANDBOX, fs, 'readFile').resolves('q = load "datasetname";');

    await Query.run(['-f', 'query.saql']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    const { data, headers } = getTableData(sfCommandStubs);
    expect(headers, 'headers').to.deep.equal(['Role Name', 'Count']);
    expectToHaveElementInclude(data, { 'Role Name': 'CEO', Count: 1 }, 'data');
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(
      messages.getMessage('rowsFound', [saqlResponse.results.records.length])
    );
    expect(requestBody, 'post request body').to.deep.equal({
      query: 'q = load "0Fb6g000000QI3fCAG/0Fb6g000000QI3fCAG";',
      queryLanguage: 'Saql',
    });
  });

  // test timezone is passed up (and no metadata returned)
  it('runs: -q foo -t Americe/Denver', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/query') && request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve(emptyResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Query.run(['-q', 'foo', '-t', 'America/Denver']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('noResultsMesg'));
    expect(requestBody, 'post request body').to.deep.equal({
      query: 'foo',
      queryLanguage: 'Saql',
      timezone: 'America/Denver',
    });
  });

  // test with no rows returned
  it('runs: -q foo (no rows)', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/query') && request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve(noRowsResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Query.run(['-q', 'foo']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('rowsFound', [0]));
    expect(requestBody, 'post request body').to.deep.equal({
      query: 'foo',
      queryLanguage: 'Saql',
    });
  });

  // test --connector
  it('runs: -q "select count(*) from SnowTable" --connector SnowflakeOne', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/dataConnectors/SnowflakeOne/query') && request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve(liveSqlResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Query.run(['-q', 'select count(*) from SnowTable', '--connector', 'SnowflakeOne']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(
      messages.getMessage('rowsFound', [liveSqlResponse.records.length])
    );
    expect(requestBody, 'post request body').to.deep.equal({
      query: 'select count(*) from SnowTable',
    });
  });

  // test --sql
  it('runs: -q foo --sql', async () => {
    await stubDefaultOrg($$, testOrg);
    let requestBody: AnyJson | undefined;
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/query') && request.method === 'POST') {
        requestBody = JSON.parse(ensureString(request.body)) as AnyJson;
        return Promise.resolve(emptyResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Query.run(['-q', 'foo', '--sql']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain(messages.getMessage('noResultsMesg'));
    expect(requestBody, 'post request body').to.deep.equal({
      query: 'foo',
      queryLanguage: 'Sql',
    });
  });

  // test --limit
  it('runs: -q foo --limit 1', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/query') && request.method === 'POST') {
        // make a copy of saqlResponse since the command will change the response.results.records
        return Promise.resolve(JSON.parse(JSON.stringify(saqlResponse)) as AnyJson);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Query.run(['-q', 'foo', '--limit', '1']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    const { data, headers } = getTableData(sfCommandStubs);
    expect(headers, 'headers').to.deep.equal(['Role Name', 'Count']);
    // make sure we only see the 1st record from the response
    expectToHaveElementInclude(data, { 'Role Name': 'CEO', Count: 1 }, 'table');
    expect(data, 'num rows').to.have.length(1);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('rowsFound', [1]));
  });

  // test csv format
  it('runs: -q foo --r csv', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/query') && request.method === 'POST') {
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Query.run(['-q', 'foo', '-r', 'csv']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain('Role Name,Count');
    expect(stdout, 'stdout').to.contain('CEO,1');
    expect(stdout, 'stdout').to.contain('CIO,1');
    expect(stdout, 'stdout').to.contain('Sales AMER,5');
    expect(stdout, 'stdout').to.contain('Sales EMEA,6');
    expect(stdout, 'stdout').to.contain('Sales WW,6');
    expect(stdout, 'stdout').to.not.contain(messages.getMessage('rowsFound', [saqlResponse.results.records.length]));
  });

  // test csv escape chars
  it('runs: -q foo --r csv (with escaping)', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/query') && request.method === 'POST') {
        return Promise.resolve(saqlResponse2);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Query.run(['-q', 'foo', '-r', 'csv']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    const stdout = getStdout(sfCommandStubs);
    expect(stdout, 'stdout').to.contain('Role Name,Count');
    expect(stdout, 'stdout').to.contain('"CEO, ""part-time""",1');
    expect(stdout, 'stdout').to.contain('""CIO"",1');
    expect(stdout, 'stdout').to.contain('"Sales\nAMER",5');
    // make sure the row count text didn't end up anywhere
    expect(stdout, 'stdout').to.not.contain(messages.getMessage('rowsFound', [saqlResponse.results.records.length]));
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.not.contain(
      messages.getMessage('rowsFound', [saqlResponse.results.records.length])
    );
  });

  // test csv with live datasets
  it('runs: -q foo --connector SnowflakeOne -r csv', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/dataConnectors/SnowflakeOne/query') && request.method === 'POST') {
        return Promise.resolve(liveSqlResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Query.run(['-q', 'foo', '--connector', 'SnowflakeOne', '-r', 'csv']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    const stdout = getStdout(sfCommandStubs);
    const columns = (liveSqlResponse.metadata as SqlLiveMetadata).columns.map((c) => c.label);
    expect(stdout, 'stdout').to.contain(columns.join(','));
    liveSqlResponse.records.forEach((r) => {
      expect(stdout, 'stdout').to.contain(columns.map((c) => (r as Record<string, string>)[c]).join(','));
    });
  });

  // test json format
  it('runs: -q foo -r json', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/query') && request.method === 'POST') {
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Query.run(['-q', 'foo', '-r', 'json']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    expect(getStyledJSON(sfCommandStubs), 'stdout json').to.deep.equal(saqlResponse);
    expect(getStdout(sfCommandStubs), 'stdout').to.not.contain(
      messages.getMessage('rowsFound', [saqlResponse.results.records.length])
    );
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.not.contain(
      messages.getMessage('rowsFound', [saqlResponse.results.records.length])
    );
  });

  // test --json
  it('runs: -q foo --json', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = (request) => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).includes('/wave/query') && request.method === 'POST') {
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfError('Invalid connection request'));
    };

    await Query.run(['-q', 'foo', '--json']);
    expect(getStderr(sfCommandStubs), 'stderr').to.equal('');
    expect(getJsonOutput(sfCommandStubs), 'stdout json').to.deep.include({ result: saqlResponse });
    expect(getStdout(sfCommandStubs), 'stdout').to.not.contain(
      messages.getMessage('rowsFound', [saqlResponse.results.records.length])
    );
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.not.contain(
      messages.getMessage('rowsFound', [saqlResponse.results.records.length])
    );
  });
});
