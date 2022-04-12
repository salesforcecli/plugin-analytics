/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// our test data is real data from a server, which uses _'s in the field names
/* eslint-disable camelcase */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/command/lib/test';
import { SfdxError } from '@salesforce/core';
import { AnyJson, JsonMap, ensureJsonMap, ensureString } from '@salesforce/ts-types';
import { QueryResponse, SaqlMetadata, SqlLiveMetadata } from '../../src/lib/analytics/query/query';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'query');

const emptyResponse: QueryResponse & JsonMap = {
  action: 'query',
  responseId: '4a6ap-I-zOFSl-F8RxRwJ-',
  results: {
    metadata: [],
    records: []
  },
  query: '',
  responseTime: 0
};

const saqlMetadata: SaqlMetadata & JsonMap = {
  lineage: {
    type: 'foreach',
    projections: [
      {
        field: {
          id: 'q.Role Name',
          type: 'string'
        },
        inputs: [
          {
            id: 'q.Role.Name'
          }
        ]
      },
      {
        field: {
          id: 'q.Count',
          type: 'numeric'
        }
      }
    ],
    input: {
      type: 'group',
      groups: [
        {
          id: 'q.Role.Name'
        }
      ]
    }
  },
  queryLanguage: 'SAQL'
};

const noRowsResponse: QueryResponse & JsonMap = {
  action: 'query',
  responseId: '4a6ap-I-zOFSl-F8RxRwJ-',
  results: {
    metadata: [saqlMetadata],
    records: []
  },
  query: '',
  responseTime: 0
};

const saqlResponse: QueryResponse & JsonMap = {
  action: 'query',
  responseId: '4a6ap-I-zOFSl-F8RxRwJ-',
  results: {
    metadata: [saqlMetadata],
    records: [
      {
        Count: 1,
        'Role Name': 'CEO'
      },
      {
        Count: 1,
        'Role Name': 'CIO'
      },
      {
        Count: 5,
        'Role Name': 'Sales AMER'
      },
      {
        Count: 6,
        'Role Name': 'Sales EMEA'
      },
      {
        Count: 6,
        'Role Name': 'Sales WW'
      }
    ]
  },
  query:
    "q = load \"0Fb6g000000QI3fCAG/0Fc6g000007NGrnCAG\";\nq = group q by 'Role.Name';\nq = foreach q generate 'Role.Name' as 'Role Name', count() as 'Count';\nq = order q by 'Role Name' asc;\nq = limit q 2000;",
  responseTime: 55
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
        'Role Name': 'CEO, "part-time"'
      },
      {
        Count: 1,
        'Role Name': '"CIO"'
      },
      {
        Count: 5,
        'Role Name': 'Sales\nAMER'
      }
    ]
  },
  query:
    "q = load \"0Fb6g000000QI3fCAG/0Fc6g000007NGrnCAG\";\nq = group q by 'Role.Name';\nq = foreach q generate 'Role.Name' as 'Role Name', count() as 'Count';\nq = order q by 'Role Name' asc;\nq = limit q 2000;",
  responseTime: 55
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
            columnType: 'varchar'
          },
          {
            columnLabel: 'Location_Description',
            columnType: 'varchar'
          }
        ],
        queryLanguage: 'SQL'
      }
    ],
    records: [
      {
        Division_Name: 'ABC',
        Location_Description: 'Bunnell FL Yard'
      },
      {
        Division_Name: 'ABC',
        Location_Description: 'Sanford FL Yard'
      },
      {
        Division_Name: 'ABC',
        Location_Description: 'Groveland FL Yard'
      },
      {
        Division_Name: 'ABC',
        Location_Description: 'Pooler GA Yard'
      },
      {
        Division_Name: 'PRE',
        Location_Description: 'Tallahassee FL Yard'
      }
    ]
  },
  query: 'SELECT Division_Name, Location_Description FROM "ABCWidgetSales2017" ORDER BY Division_Name LIMIT 10',
  responseTime: 45
};

const liveSqlResponse: QueryResponse & JsonMap = {
  metadata: {
    columns: [
      {
        label: 'CARRIER_NAME',
        type: 'varchar'
      },
      {
        label: 'AIRPORT_NAME',
        type: 'varchar'
      },
      {
        label: 'FLIGHTS',
        type: 'numeric'
      },
      {
        label: 'DELAYS',
        type: 'numeric'
      },
      {
        label: 'PCT_DELAYED',
        type: 'numeric'
      },
      {
        label: 'CARRIER_CT',
        type: 'numeric'
      },
      {
        label: 'PCT_DELAYED_CARRIER',
        type: 'numeric'
      }
    ],
    queryLanguage: 'SQL'
  },
  records: [
    {
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Albuquerque  NM: Albuquerque International Sunport',
      FLIGHTS: 246,
      DELAYS: 26,
      PCT_DELAYED: 0.105691057,
      CARRIER_CT: 10.93,
      PCT_DELAYED_CARRIER: 0.420384615
    },
    {
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Atlanta  GA: Hartsfield-Jackson Atlanta International',
      FLIGHTS: 488,
      DELAYS: 69,
      PCT_DELAYED: 0.141393443,
      CARRIER_CT: 35.13,
      PCT_DELAYED_CARRIER: 0.509130435
    },
    {
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Austin  TX: Austin - Bergstrom International',
      FLIGHTS: 580,
      DELAYS: 102,
      PCT_DELAYED: 0.175862069,
      CARRIER_CT: 43.99,
      PCT_DELAYED_CARRIER: 0.43127451
    },
    {
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Hartford  CT: Bradley International',
      FLIGHTS: 155,
      DELAYS: 37,
      PCT_DELAYED: 0.238709677,
      CARRIER_CT: 19.38,
      PCT_DELAYED_CARRIER: 0.523783784
    },
    {
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Birmingham  AL: Birmingham-Shuttlesworth International',
      FLIGHTS: 88,
      DELAYS: 19,
      PCT_DELAYED: 0.215909091,
      CARRIER_CT: 6.52,
      PCT_DELAYED_CARRIER: 0.343157895
    }
  ]
};

describe('analytics:query', () => {
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

  // test saql on command line
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).indexOf('/wave/query') >= 0 && request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:query', '-q', 'foo', '--nomapnames'])
    .it('runs analytics:query -q foo --nomapnames', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.match(/Role Name\s+Count/);
      expect(ctx.stdout, 'stdout').to.match(/CEO\s+1/);
      expect(ctx.stdout, 'stdout').to.match(/CIO\s+1/);
      expect(ctx.stdout, 'stdout').to.match(/Sales AMER\s+5/);
      expect(ctx.stdout, 'stdout').to.match(/Sales EMEA\s+6/);
      expect(ctx.stdout, 'stdout').to.match(/Sales WW\s+6/);
      expect(ctx.stdout, 'stdout').to.contain(messages.getMessage('rowsFound', [saqlResponse.results.records.length]));
      expect(requestBody, 'post request body').to.deep.equal({
        query: 'foo',
        queryLanguage: 'Saql'
      });
    });

  // test sql in a file
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).indexOf('/wave/query') >= 0 && request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(sqlResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stub(core.fs, 'readFile', () => Promise.resolve(sqlResponse.query))
    .stdout()
    .stderr()
    .command(['analytics:query', '-f', 'query.sql'])
    .it('runs analytics:query -f query.sql', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.match(/Division_Name\s+Location_Description/);
      expect(ctx.stdout, 'stdout').to.match(/ABC\s+Bunnell FL Yard/);
      expect(ctx.stdout, 'stdout').to.match(/PRE\s+Tallahassee FL Yard/);
      expect(ctx.stdout, 'stdout').to.contain(messages.getMessage('rowsFound', [sqlResponse.results.records.length]));
      expect(requestBody, 'post request body').to.deep.equal({
        query: sqlResponse.query,
        queryLanguage: 'Sql'
      });
    });

  // test saql with dataset name mapping
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      const url = ensureString(request.url);
      if (url.indexOf('/wave/datasets/') >= 0 && request.method === 'GET') {
        return Promise.resolve({
          id: '0Fb6g000000QI3fCAG',
          currentVersionId: '0Fb6g000000QI3fCAG'
        });
      } else if (url.indexOf('/wave/query') >= 0 && request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stub(core.fs, 'readFile', () => Promise.resolve('q = load "datasetname";'))
    .stderr()
    .stdout()
    .command(['analytics:query', '-f', 'query.saql'])
    .it('runs analytics:query -f query.saql', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.match(/Role Name\s+Count/);
      expect(ctx.stdout, 'stdout').to.match(/CEO\s+1/);
      expect(ctx.stdout, 'stdout').to.contain(messages.getMessage('rowsFound', [saqlResponse.results.records.length]));
      expect(requestBody, 'post request body').to.deep.equal({
        query: 'q = load "0Fb6g000000QI3fCAG/0Fb6g000000QI3fCAG";',
        queryLanguage: 'Saql'
      });
    });

  // test timezone is passed up (and no metadata returned)
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).indexOf('/wave/query') >= 0 && request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(emptyResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:query', '-q', 'foo', '-t', 'America/Denver'])
    .it('runs analytics:query -q foo -t America/Denver', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.contain(messages.getMessage('noResultsMesg'));
      expect(requestBody, 'post request body').to.deep.equal({
        query: 'foo',
        queryLanguage: 'Saql',
        timezone: 'America/Denver'
      });
    });

  // test with no rows returned
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).indexOf('/wave/query') >= 0 && request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(noRowsResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:query', '-q', 'foo'])
    .it('runs analytics:query -q foo (no rows)', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.contain(messages.getMessage('rowsFound', [0]));
      expect(requestBody, 'post request body').to.deep.equal({
        query: 'foo',
        queryLanguage: 'Saql'
      });
    });

  // test --connector
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (
        ensureString(request.url).indexOf('/wave/dataConnectors/SnowflakeOne/query') >= 0 &&
        request.method === 'POST'
      ) {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(liveSqlResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:query', '-q', 'select count(*) from SnowTable', '--connector', 'SnowflakeOne'])
    .it('runs analytics:query -q "select count(*) from SnowTable" --connector SnowflakeOne', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.contain(messages.getMessage('rowsFound', [liveSqlResponse.records.length]));
      expect(requestBody, 'post request body').to.deep.equal({
        query: 'select count(*) from SnowTable'
      });
    });

  // test --sql
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).indexOf('/wave/query') >= 0 && request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(emptyResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:query', '-q', 'foo', '--sql'])
    .it('runs analytics:query -q foo --sql', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.contain(messages.getMessage('noResultsMesg'));
      expect(requestBody, 'post request body').to.deep.equal({
        query: 'foo',
        queryLanguage: 'Sql'
      });
    });

  // test --limit
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).indexOf('/wave/query') >= 0 && request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        // make a copy of saqlResponse since the command will change the response.results.records
        return Promise.resolve(JSON.parse(JSON.stringify(saqlResponse)) as AnyJson);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:query', '-q', 'foo', '--limit', '1'])
    .it('runs analytics:query -q foo --limit 1', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.match(/Role Name\s+Count/);
      // make sure we only see the 1st record from the response
      expect(ctx.stdout, 'stdout').to.match(/CEO\s+1/);
      saqlResponse.results.records.forEach((row, i) => {
        if (i !== 0) {
          expect(ctx.stdout, 'stdout').to.not.contain(row['Role Name']);
        }
      });
      expect(ctx.stdout, 'stdout').to.contain(messages.getMessage('rowsFound', [1]));
    });

  // test csv format
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).indexOf('/wave/query') >= 0 && request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:query', '-q', 'foo', '-r', 'csv'])
    .it('runs analytics:query -q foo -r csv', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.contain('Role Name,Count');
      expect(ctx.stdout, 'stdout').to.contain('CEO,1');
      expect(ctx.stdout, 'stdout').to.contain('CIO,1');
      expect(ctx.stdout, 'stdout').to.contain('Sales AMER,5');
      expect(ctx.stdout, 'stdout').to.contain('Sales EMEA,6');
      expect(ctx.stdout, 'stdout').to.contain('Sales WW,6');
      expect(ctx.stdout, 'stdout').to.not.contain(
        messages.getMessage('rowsFound', [saqlResponse.results.records.length])
      );
      expect(requestBody, 'post request body').to.deep.equal({
        query: 'foo',
        queryLanguage: 'Saql'
      });
    });

  // test csv escape chars
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).indexOf('/wave/query') >= 0 && request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(saqlResponse2);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:query', '-q', 'foo', '-r', 'csv'])
    .it('runs analytics:query -q foo -r csv (with escaping)', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.contain('Role Name,Count');
      expect(ctx.stdout, 'stdout').to.contain('"CEO, ""part-time""",1');
      expect(ctx.stdout, 'stdout').to.contain('""CIO"",1');
      expect(ctx.stdout, 'stdout').to.contain('"Sales\nAMER",5');
      expect(ctx.stdout, 'stdout').to.not.contain(
        messages.getMessage('rowsFound', [saqlResponse.results.records.length])
      );
      expect(requestBody, 'post request body').to.deep.equal({
        query: 'foo',
        queryLanguage: 'Saql'
      });
    });

  // test csv with live datasets
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (
        ensureString(request.url).indexOf('/wave/dataConnectors/SnowflakeOne/query') >= 0 &&
        request.method === 'POST'
      ) {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(liveSqlResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:query', '-q', 'foo', '--connector', 'SnowflakeOne', '-r', 'csv'])
    .it('runs analytics:query -q foo --connector SnowflakeOne -r csv', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      const columns = (liveSqlResponse.metadata as SqlLiveMetadata).columns.map(c => c.label);
      expect(ctx.stdout, 'stdout').to.contain(columns.join(','));
      liveSqlResponse.records.forEach(r => {
        expect(ctx.stdout, 'stdout').to.contain(columns.map(c => (r as Record<string, string>)[c]).join(','));
      });
      expect(requestBody, 'post request body').to.deep.equal({ query: 'foo' });
    });

  // test json format
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).indexOf('/wave/query') >= 0 && request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:query', '-q', 'foo', '-r', 'json'])
    .it('runs analytics:query -q foo -r json', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.not.contain(
        messages.getMessage('rowsFound', [saqlResponse.results.records.length])
      );
      // for some reason, the fancy-test stuff always slaps this on the end of the stdout, but the command
      // doesn't do this when run regularly, so just trim it off for now
      const fixedStdout = ctx.stdout.replace('No results found.', '');
      expect(JSON.parse(fixedStdout), 'stdout json').to.deep.equal(saqlResponse);
      expect(requestBody, 'post request body').to.deep.equal({
        query: 'foo',
        queryLanguage: 'Saql'
      });
    });

  // test --json
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(request => {
      request = ensureJsonMap(request);
      if (ensureString(request.url).indexOf('/wave/query') >= 0 && request.method === 'POST') {
        saveOffRequestBody(ensureString(request.body));
        return Promise.resolve(saqlResponse);
      }
      return Promise.reject(new SfdxError('Invalid connection request'));
    })
    .stderr()
    .stdout()
    .command(['analytics:query', '-q', 'foo', '--json'])
    .it('runs analytics:query -q foo --json', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.not.contain(
        messages.getMessage('rowsFound', [saqlResponse.results.records.length])
      );
      expect(JSON.parse(ctx.stdout), 'stdout json').to.deep.equal({
        status: 0,
        result: saqlResponse
      });
      expect(requestBody, 'post request body').to.deep.equal({
        query: 'foo',
        queryLanguage: 'Saql'
      });
    });
});
