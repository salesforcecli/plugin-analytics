/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
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

const liveDatasetJson = {
  clientShardsUrl: '/services/data/v53.0/wave/datasets/0FbR000000056n1KAA/shards',
  createdBy: {
    id: '005R0000000t2B1IAI',
    name: 'Admin User',
    profilePhotoUrl: 'https://karilwctesting-dev-ed--c.stmpa.stm.documentforce.com/profilephoto/005/T'
  },
  createdDate: '2021-04-20T21:36:54.000Z',
  currentVersionId: '0FcR0000000M6qRKAS',
  currentVersionUrl: '/services/data/v53.0/wave/datasets/0FbR000000056n1KAA/versions/0FcR0000000M6qRKAS',
  dataRefreshDate: '2021-04-20T21:36:54.000Z',
  datasetType: 'live',
  folder: {
    id: '00lR0000000V3a0IAC',
    label: 'LWC Testing',
    name: 'LWC_Testing',
    url: '/services/data/v53.0/wave/folders/00lR0000000V3a0IAC'
  },
  id: '0FbR000000056n1KAA',
  label: 'AIRLINE_DELAYS',
  lastAccessedDate: '2021-05-03T17:38:32.000Z',
  lastModifiedBy: {
    id: '005R0000000t2B1IAI',
    name: 'Admin User',
    profilePhotoUrl: 'https://karilwctesting-dev-ed--c.stmpa.stm.documentforce.com/profilephoto/005/T'
  },
  lastModifiedDate: '2021-04-20T21:36:54.000Z',
  liveConnection: {
    connectionLabel: 'SnowflakeOne',
    connectionName: 'SnowflakeOne',
    connectionType: 'SnowflakeDirect',
    sourceObjectName: 'AIRLINE_DELAYS'
  },
  name: 'AIRLINE_DELAYS',
  namespace: 'SomeNamespace',
  permissions: {
    create: true,
    manage: true,
    modify: true,
    view: true
  },
  type: 'dataset',
  url: '/services/data/v53.0/wave/datasets/0FbR000000056n1KAA',
  versionsUrl: '/services/data/v53.0/wave/datasets/0FbR000000056n1KAA/versions',
  visibility: 'All'
};

describe('analytics:dataset:display', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(datasetJson))
    .stdout()
    .command(['analytics:dataset:display', '--datasetid', datasetJson.id])
    .it(`runs analytics:dataset:display --datasetid ${datasetJson.id}`, ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('displayDetailHeader'));
      expect(ctx.stdout).to.contain(datasetJson.id);
      expect(ctx.stdout).to.contain(datasetJson.name);
      expect(ctx.stdout).to.contain(datasetJson.datasetType);
      expect(ctx.stdout).to.contain(datasetJson.folder.id);
      expect(ctx.stdout).to.contain(datasetJson.createdBy.name);
      expect(ctx.stdout).to.contain(datasetJson.lastModifiedBy.name);
      expect(ctx.stdout).to.not.contain('Live Connection Name');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(datasetJson))
    .stdout()
    .command(['analytics:dataset:display', '--datasetname', datasetJson.name])
    .it(`runs analytics:dataset:display --datasetname ${datasetJson.name}`, ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('displayDetailHeader'));
      expect(ctx.stdout).to.contain(datasetJson.id);
      expect(ctx.stdout).to.contain(datasetJson.name);
      expect(ctx.stdout).to.contain(datasetJson.datasetType);
      expect(ctx.stdout).to.contain(datasetJson.folder.id);
      expect(ctx.stdout).to.contain(datasetJson.createdBy.name);
      expect(ctx.stdout).to.contain(datasetJson.lastModifiedBy.name);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(liveDatasetJson))
    .stdout()
    .command(['analytics:dataset:display', '-n', liveDatasetJson.name])
    .it(`runs analytics:dataset:display -n ${liveDatasetJson.name} (live dataset)`, ctx => {
      expect(ctx.stdout).to.contain(messages.getMessage('displayDetailHeader'));
      expect(ctx.stdout).to.match(new RegExp(`^Id\\s+${liveDatasetJson.id}$`, 'm'));
      expect(ctx.stdout).to.match(new RegExp(`^Namespace\\s+${liveDatasetJson.namespace}$`, 'm'));
      expect(ctx.stdout).to.match(new RegExp(`^Name\\s+${liveDatasetJson.name}$`, 'm'));
      expect(ctx.stdout).to.match(new RegExp(`^Label\\s+${liveDatasetJson.label}$`, 'm'));
      expect(ctx.stdout).to.match(new RegExp(`^Type\\s+${liveDatasetJson.datasetType}$`, 'm'));
      expect(ctx.stdout).to.match(new RegExp(`^Current Version Id\\s+${liveDatasetJson.currentVersionId}$`, 'm'));
      expect(ctx.stdout).to.match(new RegExp(`^Folder Id\\s+${liveDatasetJson.folder.id}$`, 'm'));
      expect(ctx.stdout).to.match(new RegExp(`^Folder Label\\s+${liveDatasetJson.folder.label}$`, 'm'));
      expect(ctx.stdout).to.match(new RegExp(`^Created By\\s+${liveDatasetJson.createdBy.name}$`, 'm'));
      expect(ctx.stdout).to.match(new RegExp(`^Last Modified By\\s+${liveDatasetJson.lastModifiedBy.name}$`, 'm'));
      expect(ctx.stdout).to.match(
        new RegExp(`^Live Connection Name\\s+${liveDatasetJson.liveConnection.connectionName}$`, 'm')
      );
      expect(ctx.stdout).to.match(
        new RegExp(`^Live Connection Label\\s+${liveDatasetJson.liveConnection.connectionLabel}$`, 'm')
      );
      expect(ctx.stdout).to.match(
        new RegExp(`^Live Connection Type\\s+${liveDatasetJson.liveConnection.connectionType}$`, 'm')
      );
      expect(ctx.stdout).to.match(
        new RegExp(`^Live Connection Source Object\\s+${liveDatasetJson.liveConnection.sourceObjectName}$`, 'm')
      );
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.reject(new Error('Should not have been called')))
    .stderr()
    .command(['analytics:dataset:display'])
    .it('runs analytics:dataset:display', ctx => {
      expect(ctx.stderr).to.contain(messages.getMessage('missingRequiredField'));
    });
});
