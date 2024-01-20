/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import Display from '../../../src/commands/analytics/app/display.js';
import {
  expectToHaveElementInclude,
  expectToHaveElementValue,
  getStdout,
  getStyledHeaders,
  getTableData,
  stubDefaultOrg,
} from '../../testutils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

const ID = '00lxx000000j9PxAAI';

function makeFolderJson(withAppLog: boolean, namespace?: string) {
  // this is what the folder json looks like (49+, at least)
  const json = {
    appLog: [
      {
        message: 'Successfully created dataset [Dataset01234567890123456789012345678901234567891].',
      },
      {
        message: 'Successfully created resource type [dashboard], label [Account Dashboard].',
      },
      {
        message:
          'Successfully created resource type [workflow], label [Dataflow0123456789012345678901234567890123456789].',
      },
      {
        // this message does seem to really contain a trailing space in the server
        message: 'Dataflow plan [0ePxx00000000KzEAI] completed with status [Success]. ',
      },
      {
        message:
          'Successfully created resource type [xmd], label [Dataset0123456789012345678901234567890123456789_tp].',
      },
      {
        message: 'Creating application [foobar] was successful.',
      },
    ],
    applicationStatus: 'completedstatus',
    assetSharingUrl:
      'http://gregorysmi-wsm.internal.salesforce.com:6109/analytics/wave/application?assetId=00lxx000000j9PxAAI&orgId=00Dxx0000006I5H&loginHost=gregorysmi-wsm.internal.salesforce.com&urlType=sharing',
    attachedFiles: [],
    canBeSharedExternally: false,
    createdBy: {
      id: '005xx000001XB1RAAW',
      name: 'User User',
      profilePhotoUrl: '/profilephoto/005/T',
    },
    createdDate: '2020-03-05T16:56:26.000Z',
    featuredAssets: {},
    icon: {
      id: '00lxx000000j9PxAAI',
      name: '16.png',
      url: '/analytics/wave/web/proto/images/app/icons/16.png',
    },
    id: ID,
    isPinned: false,
    label: 'foo bar',
    lastModifiedBy: {
      id: '005xx000001XB1RAAW',
      name: 'User User',
      profilePhotoUrl: '/profilephoto/005/T',
    },
    lastModifiedDate: '2020-03-05T16:56:29.000Z',
    name: 'foobar',
    namespace,
    permissions: {
      create: true,
      manage: true,
      modify: true,
      view: true,
    },
    shares: [
      {
        accessType: 'manage',
        imageUrl: '/profilephoto/005/T',
        shareType: 'user',
        sharedWithId: '005xx000001XB1RAAW',
        sharedWithLabel: 'User User',
      },
    ],
    templateOptions: {
      appAction: 'create',
      appActionDate: '2020-03-05T16:56:25.617Z',
      appActionUser: {
        id: '005xx000001XB1RAAW',
      },
    },
    templateSourceId: '0Nkxx0000004DDACA2',
    templateValues: {
      Overrides: {
        createAllDashboards: true,
        createAllLenses: true,
        createAllExternalFiles: true,
        createDataflow: true,
        createAllDatasetFiles: true,
        createAllImages: true,
      },
    },
    templateVersion: '1.1',
    type: 'folder',
    url: '/services/data/v49.0/wave/folders/00lxx000000j9PxAAI',
  };
  if (!withAppLog) {
    json.appLog = [];
  }
  return json;
}

function verifyAppDetails({ data, headers }: ReturnType<typeof getTableData>, namespace?: string) {
  expect(headers, 'headers').to.deep.equal(['key', 'value']);
  expectToHaveElementInclude(data, { key: 'Name', value: 'foobar' }, 'table');
  expectToHaveElementInclude(data, { key: 'Label', value: 'foo bar' }, 'table');
  expectToHaveElementInclude(data, { key: 'Id', value: ID }, 'table');
  expectToHaveElementInclude(data, { key: 'Created By', value: 'User User' }, 'table');
  // just make sure it looks like a date, to avoid issues with timezone conversion
  expectToHaveElementValue(data, /2020-03-\d\d \d\d:\d\d:\d\d$/m, 'table');
  expectToHaveElementInclude(data, { key: 'Last Modified By', value: 'User User' }, 'table');
  expectToHaveElementInclude(data, { key: 'Template Source Id', value: '0Nkxx0000004DDACA2' }, 'table');
  expectToHaveElementInclude(data, { key: 'Template Version', value: '1.1' }, 'table');
  if (namespace) {
    expectToHaveElementInclude(data, { key: 'Namespace', value: namespace }, 'table');
  }
}

describe('analytics:app:display', () => {
  const folderJsonNoLog = makeFolderJson(false);
  const folderJsonLog = makeFolderJson(true);
  const nsFolderJson = makeFolderJson(false, 'AnlyTxHack');

  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  it(`runs: --folderid ${ID}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(folderJsonNoLog);

    await Display.run(['--folderid', ID]);
    verifyAppDetails(getTableData(sfCommandStubs));
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.not.contain(messages.getMessage('displayLogHeader'));
  });

  it(`runs: --folderid ${ID} (with namespace)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(nsFolderJson);

    await Display.run(['--folderid', ID]);
    verifyAppDetails(getTableData(sfCommandStubs));
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.not.contain(messages.getMessage('displayLogHeader'));
  });

  it(`runs: --folderid ${ID} --applog (with no applog)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(folderJsonNoLog);

    await Display.run(['--folderid', ID, '--applog']);
    verifyAppDetails(getTableData(sfCommandStubs));
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('displayLogHeader'));
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('displayNoLogAvailable'));
  });

  it(`runs: -f ${ID} (with applog)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(folderJsonLog);

    await Display.run(['-f', ID]);
    verifyAppDetails(getTableData(sfCommandStubs));
    // no -a, so no applog output
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.not.contain(messages.getMessage('displayLogHeader'));
    const stdout = getStdout(sfCommandStubs);
    folderJsonLog.appLog.forEach((line) => {
      expect(stdout, 'stdout').to.not.contain(line);
    });
  });

  it(`runs: -f ${ID} -a (with applog)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(folderJsonLog);

    await Display.run(['-f', ID, '-a']);
    verifyAppDetails(getTableData(sfCommandStubs));
    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('displayLogHeader'));
    const { data: appLogData } = getTableData(sfCommandStubs, 1);
    folderJsonLog.appLog.forEach((line) => {
      expectToHaveElementValue(appLogData, line.message, 'app log table');
    });
  });
});
