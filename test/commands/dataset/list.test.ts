/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { core } from '@salesforce/command';
import { expect, test } from '@salesforce/command/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'dataset');

const datasetJson = {
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

const nsDatasetJson = {
  clientShardsUrl: '/services/data/v53.0/wave/datasets/0FbR000000057SlKAI/shards',
  createdBy: {
    id: '005R0000000vpWGIAY',
    name: 'Automated Process',
    profilePhotoUrl: 'https://coffee-beans-1986-dev-ed--c.stmpa.stm.documentforce.com/profilephoto/005/T'
  },
  createdDate: '2021-04-29T15:28:49.000Z',
  currentVersionId: '0FcR0000000MFtXKAW',
  currentVersionUrl: '/services/data/v53.0/wave/datasets/0FbR000000057SlKAI/versions/0FcR0000000MFtXKAW',
  dataRefreshDate: '2021-04-29T15:30:32.000Z',
  datasetType: 'default',
  folder: {
    id: '00lR0000000VSUmIAO',
    label: 'TrendFinder',
    name: 'TrendFinder',
    namespace: 'AnlyTxHack',
    url: '/services/data/v53.0/wave/folders/00lR0000000VSUmIAO'
  },
  id: '0FbR000000057SlKAI',
  label: 'cestabasica',
  lastAccessedDate: '2021-04-30T22:09:31.000Z',
  lastModifiedBy: {
    id: '005R0000000vpWGIAY',
    name: 'Automated Process',
    profilePhotoUrl: 'https://coffee-beans-1986-dev-ed--c.stmpa.stm.documentforce.com/profilephoto/005/T'
  },
  lastModifiedDate: '2021-04-29T15:30:32.000Z',
  lastQueriedDate: '2021-04-30T22:00:38.000Z',
  licenseAttributes: {
    type: 'einsteinanalytics'
  },
  name: 'cestabasica',
  namespace: 'AnlyTxHack',
  permissions: {
    create: true,
    manage: true,
    modify: true,
    view: true
  },
  type: 'dataset',
  url: '/services/data/v53.0/wave/datasets/0FbR000000057SlKAI',
  userXmd: {},
  versionsUrl: '/services/data/v53.0/wave/datasets/0FbR000000057SlKAI/versions',
  visibility: 'All'
};

describe('analytics:dataset:list', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ datasets: [datasetJson, nsDatasetJson] }))
    .stderr()
    .stdout()
    .command(['analytics:dataset:list'])
    .it('runs analytics:dataset:list', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(ctx.stdout, 'stdout').to.contain(messages.getMessage('datasetsFound', [2]));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ datasets: [datasetJson, nsDatasetJson] }))
    .stderr()
    .stdout()
    .command(['analytics:dataset:list', '--json'])
    .it('runs analytics:dataset:list --json', ctx => {
      expect(ctx.stderr, 'stderr').to.equal('');
      expect(JSON.parse(ctx.stdout), 'stdout json').to.deep.equal({
        status: 0,
        result: [
          {
            id: datasetJson.id,
            name: datasetJson.name,
            label: datasetJson.label,
            currentversionid: datasetJson.currentVersionId,
            folderid: datasetJson.folder.id
          },
          {
            id: nsDatasetJson.id,
            namespace: nsDatasetJson.namespace,
            name: nsDatasetJson.name,
            label: nsDatasetJson.label,
            currentversionid: nsDatasetJson.currentVersionId,
            folderid: nsDatasetJson.folder.id
          }
        ]
      });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve({ datasets: [] }))
    .stderr()
    .stdout()
    .command(['analytics:dataset:list'])
    .it('runs analytics:dataset:list (no results)', ctx => {
      expect(ctx.stderr).to.equal('');
      expect(ctx.stdout).to.contain('No results found.');
    });
});