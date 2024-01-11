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
import { getStdout, stubDefaultOrg } from '../../testutils.js';

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

function verifyAppDetails(stdout: string, namespace?: string) {
  expect(stdout, 'stdout').to.match(/^Name\s+foobar$/m);
  expect(stdout, 'stdout').to.match(/^Label\s+foo bar$/m);
  expect(stdout, 'stdout').to.match(new RegExp(`^Id\\s+${ID}$`, 'm'));
  expect(stdout, 'stdout').to.match(/^Created By\s+User User$/m);
  // just make sure it looks like a date, to avoid issues with timezone conversion
  expect(stdout, 'stdout').to.match(/^Created Date\s+2020-03-\d\d \d\d:\d\d:\d\d$/m);
  expect(stdout, 'stdout').to.match(/^Last Modified By\s+User User$/m);
  expect(stdout, 'stdout').to.match(/^Last Modified Date\s+2020-03-\d\d \d\d:\d\d:\d\d$/m);
  expect(stdout, 'stdout').to.match(/^Template Source Id\s+0Nkxx0000004DDACA2$/m);
  expect(stdout, 'stdout').to.match(/^Template Version\s+1\.1$/m);
  if (namespace) {
    expect(stdout, 'stdout').to.match(new RegExp(`^Namespace\\s+${namespace}$`, 'm'));
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
    const stdout = getStdout(sfCommandStubs);
    verifyAppDetails(stdout);
    expect(stdout, 'stdout').to.not.contain(messages.getMessage('displayLogHeader'));
  });

  it(`runs: --folderid ${ID} (with namespace)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(nsFolderJson);

    await Display.run(['--folderid', ID]);
    const stdout = getStdout(sfCommandStubs);
    verifyAppDetails(stdout, 'AnlyTxHack');
    expect(stdout, 'stdout').to.not.contain(messages.getMessage('displayLogHeader'));
  });

  it(`runs: --folderid ${ID} --applog (with no applog)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(folderJsonNoLog);

    await Display.run(['--folderid', ID, '--applog']);
    const stdout = getStdout(sfCommandStubs);
    verifyAppDetails(stdout);
    expect(stdout, 'stdout').to.contain(messages.getMessage('displayLogHeader'));
    expect(stdout, 'stdout').to.contain(messages.getMessage('displayNoLogAvailable'));
  });

  it(`runs: -f ${ID} (with applog)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(folderJsonLog);

    await Display.run(['-f', ID]);
    const stdout = getStdout(sfCommandStubs);
    verifyAppDetails(stdout);
    // no -a, so no applog output
    expect(stdout, 'stdout').to.not.contain(messages.getMessage('displayLogHeader'));
    folderJsonLog.appLog.forEach((line) => {
      expect(stdout, 'stdout').to.not.contain(line);
    });
  });

  it(`runs: -f ${ID} -a (with applog)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(folderJsonLog);

    await Display.run(['-f', ID, '-a']);
    const stdout = getStdout(sfCommandStubs);
    verifyAppDetails(stdout);
    // no -a, so no applog output
    expect(stdout, 'stdout').to.contain(messages.getMessage('displayLogHeader'));
    folderJsonLog.appLog.forEach((line) => {
      expect(stdout, 'stdout').to.contain(line);
    });
  });
});
