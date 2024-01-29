/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { computeColumnNames, mapDatasetNames, QueryResponse } from '../../../../src/lib/analytics/query/query.js';

describe('QuerySvc', () => {
  describe('computeColumnNames()', () => {
    it('computes Saql column names', () => {
      const response: QueryResponse = {
        action: 'query',
        query: '',
        responseId: '',
        responseTime: 0,
        results: {
          records: [],
          metadata: [
            {
              lineage: {
                type: 'foreach',
                projections: [
                  {
                    field: {
                      id: 'q.Role.Name',
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
                      id: 'q.count',
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
            },
          ],
        },
      };

      const names = computeColumnNames(response);
      expect(names).to.have.ordered.members(['Role.Name', 'count']);
    }); // compute Saql column names

    it('computes Sql column names', () => {
      const response: QueryResponse = {
        action: 'query',
        query: '',
        responseId: '',
        responseTime: 0,
        results: {
          records: [],
          metadata: [
            {
              columns: [
                {
                  columnLabel: 'Col1',
                  columnType: 'varchar',
                },
                {
                  columnLabel: 'Col2',
                  columnType: 'number',
                },
              ],
              queryLanguage: 'SQL',
            },
          ],
        },
      };

      const names = computeColumnNames(response);
      expect(names).to.have.ordered.members(['Col1', 'Col2']);
    }); // compute Sql column names

    it('computes Live Sql column names', () => {
      const response: QueryResponse = {
        records: [],
        metadata: {
          columns: [
            {
              label: 'ColUno',
              type: 'varchar',
            },
            {
              label: 'ColDos',
              type: 'numeric',
            },
          ],
        },
      };

      const names = computeColumnNames(response);
      expect(names).to.have.ordered.members(['ColUno', 'ColDos']);
    }); // compute Live Sql column names

    it('compute column names from records', () => {
      const response: QueryResponse = {
        action: 'query',
        query: '',
        responseId: '',
        responseTime: 0,
        results: {
          records: [
            {
              DivisionName: 'AMER',
              'Sales Amount': 1234.56,
            },
            {},
          ],
          metadata: [],
        },
      };

      const names = computeColumnNames(response);
      expect(names).to.have.ordered.members(['DivisionName', 'Sales Amount']);
    }); // compute column names from records

    it('compute column names from live sql records', () => {
      const response: QueryResponse = {
        records: [
          {
            DivisionName: 'AMER',
            'Sales Amount': 1234.56,
          },
          {},
        ],
        metadata: {
          columns: [],
        },
      };

      const names = computeColumnNames(response);
      expect(names).to.have.ordered.members(['DivisionName', 'Sales Amount']);
    }); // compute column names from live sql records
  });

  describe('mapDatasetNames()', () => {
    async function nameToRef(this: Record<string, string>, name: string): Promise<string> {
      if (this[name]) {
        return this[name];
      }
      throw new Error(`Unrecognized dataset name ${name}`);
    }

    it('replaces name with ref', async () => {
      const origQuery = `
        q1 = load "ABCWidgetSales2017";
        q2 = foreach q1 generate 'Adjusted_COGS' as 'Adjusted COGS', 'DIVISION_NUM' as 'Division Num';
        q3 = limit q2 10;
      `;

      const query = await mapDatasetNames(
        origQuery,
        nameToRef.bind({ ABCWidgetSales2017: '0Fb6g000000QI3fCAG/0Fc6g000007NGrnCAG' })
      );
      expect(query).to.not.contain('"ABCWidgetSales2017"');
      expect(query).to.contain('q1 = load "0Fb6g000000QI3fCAG/0Fc6g000007NGrnCAG";');
    });

    it('replaces names with refs', async () => {
      const origQuery = `
        ops = load "Ops";
        meetings = load "Meetings";
        q = cogroup ops by 'Account', meetings by 'Company';
        q = foreach q generate ops.'Account' as 'Account', sum(ops.'Amount') as 'sum_Amount',
                               sum(meetings.'MeetingDuration') as 'TimeSpent';
      `;

      const query = await mapDatasetNames(
        origQuery,
        nameToRef.bind({
          Ops: '0Fb6g000000QI3fCAG/0Fc6g000007NGrnCAG',
          Meetings: '0Fb6g000000QI3fCAG/0Fc6g000007NGrnCAG',
        })
      );
      expect(query).to.not.contain('"Ops"');
      expect(query).to.contain('ops = load "0Fb6g000000QI3fCAG/0Fc6g000007NGrnCAG";');
      expect(query).to.not.contain('"Meetings"');
      expect(query).to.contain('meetings = load "0Fb6g000000QI3fCAG/0Fc6g000007NGrnCAG";');
    });

    it('ignores existing refs', async () => {
      const origQuery = `
        q1 = load "0Fb6g000000QI3fCAG/0Fc6g000007NGrnCAG";
        q2 = foreach q1 generate 'Adjusted_COGS' as 'Adjusted COGS', 'DIVISION_NUM' as 'Division Num';
      `;

      const query = await mapDatasetNames(origQuery, () => {
        throw new Error('nameToRef should not have been called');
      });
      expect(query).to.equal(origQuery);
    });
  });
});

// TODO: figure out why these test execution aren't getting included in code coverage, e.g.
// 'compute column names from records' covers that part of computeColumnNames, but doesn't show as covered
