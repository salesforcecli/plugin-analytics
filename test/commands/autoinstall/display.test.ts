/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as core from '@salesforce/core';
import { expect, test } from '@salesforce/sf-plugins-core/lib/test';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('@salesforce/analytics', 'app');

const ID = '0UZ9A000000Cz6bWAC';
function makeAutoInstallJson() {
  // this is what the auto-install json is like
  const json = {
    configuration: {
      appConfiguration: {
        autoShareWithLicensedUsers: false,
        autoShareWithOriginator: true,
        deleteAppOnConstructionFailure: false,
        failOnDuplicateNames: false,
        values: [],
        parentRequestIds: [],
      },
    },
    createdBy: {
      id: '005xx000001XB1RAAW',
      name: 'Automated Process',
      profilePhotoUrl: 'https://flow-business-748--c.documentforce.com/profilephoto/005/T',
    },
    createdDate: '2020-03-05T16:56:26.000Z',
    id: '0UZ9A000000Cz6bWAC',
    lastModifiedBy: {
      id: '005xx000001XB1RAAW',
      name: 'Automated Process',
      profilePhotoUrl: '/profilephoto/005/T',
    },
    lastModifiedDate: '2020-03-05T16:56:29.000Z',
    parentRequests: [],
    requestLog: 'Auto-install request completed successfully.',
    requestName: 'AutoInstallRequest WaveEnable',
    requestStatus: 'Success',
    requestType: 'WaveEnable',
    url: '/services/data/v55.0/wave/auto-install-requests/0UZ9A000000Cz6bWAC',
  };
  return json;
}

function verifyAppDetails(stdout: string) {
  expect(stdout).to.match(new RegExp(`^Id\\s+${ID}$`, 'm'));
  expect(stdout).to.match(/^Created By\s+Automated Process$/m);
  // just make sure it looks like a date, to avoid issues with timezone conversion
  expect(stdout).to.match(/^Created Date\s+2020-03-\d\d \d\d:\d\d:\d\d$/m);
  expect(stdout).to.match(/^Last Modified By\s+Automated Process$/m);
  expect(stdout).to.match(/^Last Modified Date\s+2020-03-\d\d \d\d:\d\d:\d\d$/m);
}

describe('analytics:app:display', () => {
  const displayJson = makeAutoInstallJson();

  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest(() => Promise.resolve(displayJson))
    .stdout()
    .command(['analytics:autoinstall:display', '--autoinstallid', ID])
    .it(`runs analytics:autoinstall:display --autoinstallid ${ID}`, (ctx) => {
      verifyAppDetails(ctx.stdout);
      expect(ctx.stdout).to.not.contain(messages.getMessage('displayLogHeader'));
    });
});
