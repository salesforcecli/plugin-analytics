/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages, SfError } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import Display from '../../../src/commands/analytics/dataset/display.js';
import {
  expectToHaveElementInclude,
  expectToHaveElementValue,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataset');

const datasetJson = {
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

const liveDatasetJson = {
  clientShardsUrl: '/services/data/v53.0/wave/datasets/0FbR000000056n1KAA/shards',
  createdBy: {
    id: '005R0000000t2B1IAI',
    name: 'Admin User',
    profilePhotoUrl: 'https://karilwctesting-dev-ed--c.stmpa.stm.documentforce.com/profilephoto/005/T',
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
    url: '/services/data/v53.0/wave/folders/00lR0000000V3a0IAC',
  },
  id: '0FbR000000056n1KAA',
  label: 'AIRLINE_DELAYS',
  lastAccessedDate: '2021-05-03T17:38:32.000Z',
  lastModifiedBy: {
    id: '005R0000000t2B1IAI',
    name: 'Admin User',
    profilePhotoUrl: 'https://karilwctesting-dev-ed--c.stmpa.stm.documentforce.com/profilephoto/005/T',
  },
  lastModifiedDate: '2021-04-20T21:36:54.000Z',
  liveConnection: {
    connectionLabel: 'SnowflakeOne',
    connectionName: 'SnowflakeOne',
    connectionType: 'SnowflakeDirect',
    sourceObjectName: 'AIRLINE_DELAYS',
  },
  name: 'AIRLINE_DELAYS',
  namespace: 'SomeNamespace',
  permissions: {
    create: true,
    manage: true,
    modify: true,
    view: true,
  },
  type: 'dataset',
  url: '/services/data/v53.0/wave/datasets/0FbR000000056n1KAA',
  versionsUrl: '/services/data/v53.0/wave/datasets/0FbR000000056n1KAA/versions',
  visibility: 'All',
};

describe('analytics:dataset:display', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --datasetid ${datasetJson.id}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(datasetJson);

    await Display.run(['--datasetid', datasetJson.id]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('displayDetailHeader'));
    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementValue(data, datasetJson.id, 'table');
    expectToHaveElementValue(data, datasetJson.name, 'table');
    expectToHaveElementValue(data, datasetJson.datasetType, 'table');
    expectToHaveElementValue(data, datasetJson.folder.id, 'table');
    expectToHaveElementValue(data, datasetJson.createdBy.name, 'table');
    expectToHaveElementValue(data, datasetJson.lastModifiedBy.name, 'table');
    // expect(stdout, 'stdout').to.not.contain('Live Connection Name');
  });

  it(`runs: --datasetname ${datasetJson.name}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(datasetJson);

    await Display.run(['--datasetname', datasetJson.name]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('displayDetailHeader'));
    const { data } = getTableData(sfCommandStubs);
    expectToHaveElementValue(data, datasetJson.id, 'table');
    expectToHaveElementValue(data, datasetJson.name, 'table');
    expectToHaveElementValue(data, datasetJson.datasetType, 'table');
    expectToHaveElementValue(data, datasetJson.folder.id, 'table');
    expectToHaveElementValue(data, datasetJson.createdBy.name, 'table');
    expectToHaveElementValue(data, datasetJson.lastModifiedBy.name, 'table');
  });

  it(`runs: -n ${liveDatasetJson.name}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(liveDatasetJson);

    await Display.run(['-n', liveDatasetJson.name]);
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('displayDetailHeader'));
    const { data, headers } = getTableData(sfCommandStubs);
    expect(headers, 'headers').to.deep.equal(['key', 'value']);
    expectToHaveElementInclude(data, { key: 'Id', value: liveDatasetJson.id }, 'table');
    expectToHaveElementInclude(data, { key: 'Namespace', value: liveDatasetJson.namespace }, 'table');
    expectToHaveElementInclude(data, { key: 'Name', value: liveDatasetJson.name }, 'table');
    expectToHaveElementInclude(data, { key: 'Label', value: liveDatasetJson.label }, 'table');
    expectToHaveElementInclude(data, { key: 'Type', value: liveDatasetJson.datasetType }, 'table');
    expectToHaveElementInclude(data, { key: 'Current Version Id', value: liveDatasetJson.currentVersionId }, 'table');
    expectToHaveElementInclude(data, { key: 'Folder Id', value: liveDatasetJson.folder.id }, 'table');
    expectToHaveElementInclude(data, { key: 'Folder Label', value: liveDatasetJson.folder.label }, 'table');
    expectToHaveElementInclude(data, { key: 'Created By', value: liveDatasetJson.createdBy.name }, 'table');
    expectToHaveElementInclude(data, { key: 'Last Modified By', value: liveDatasetJson.lastModifiedBy.name }, 'table');
    expectToHaveElementInclude(
      data,
      { key: 'Live Connection Name', value: liveDatasetJson.liveConnection.connectionName },
      'table'
    );
    expectToHaveElementInclude(
      data,
      { key: 'Live Connection Label', value: liveDatasetJson.liveConnection.connectionLabel },
      'table'
    );
    expectToHaveElementInclude(
      data,
      { key: 'Live Connection Type', value: liveDatasetJson.liveConnection.connectionType },
      'table'
    );
    expectToHaveElementInclude(
      data,
      { key: 'Live Connection Source Object', value: liveDatasetJson.liveConnection.sourceObjectName },
      'table'
    );
  });

  it('runs (missing required field', async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.reject(new Error('Should not have been called'));

    try {
      await Display.run([]);
    } catch (error) {
      expect(error, 'error').to.be.instanceOf(SfError);
      expect((error as SfError).message, 'error message').to.contain(messages.getMessage('missingRequiredField'));
    }
  });
});
