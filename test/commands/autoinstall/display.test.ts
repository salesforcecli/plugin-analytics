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
import Display from '../../../src/commands/analytics/autoinstall/display.js';
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

const ID = '0UZ9A000000Cz6bWAC';
function makeAutoInstallJson() {
  // this is what the auto-install json is like
  return {
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
}

describe('analytics:app:display', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });
  afterEach(() => {
    $$.restore();
  });

  const autoInstallRequest = makeAutoInstallJson();

  it(`runs: --autoinstallid ${ID}`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(autoInstallRequest);

    await Display.run(['--autoinstallid', ID]);
    const { data, headers } = getTableData(sfCommandStubs);
    expect(headers, 'headers').to.deep.equal(['key', 'value']);
    expectToHaveElementInclude(data, { key: 'Id', value: ID }, 'table');
    expectToHaveElementInclude(data, { key: 'Created By', value: 'Automated Process' }, 'table');
    expectToHaveElementInclude(data, { key: 'Last Modified By', value: 'Automated Process' }, 'table');
    // just make sure it has least one of the dates
    expectToHaveElementValue(data, /2020-03-\d\d \d\d:\d\d:\d\d$/m, 'table');

    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.not.contain(messages.getMessage('displayLogHeader'));
  });

  it(`runs: --autoinstallid ${ID} -a (with no app log)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () => Promise.resolve(autoInstallRequest);

    await Display.run(['--autoinstallid', ID, '-a']);
    const { data, headers } = getTableData(sfCommandStubs);
    expect(headers, 'headers').to.deep.equal(['key', 'value']);
    expectToHaveElementInclude(data, { key: 'Id', value: ID }, 'table');
    expectToHaveElementInclude(data, { key: 'Created By', value: 'Automated Process' }, 'table');
    expectToHaveElementInclude(data, { key: 'Last Modified By', value: 'Automated Process' }, 'table');
    // just make sure it has least one of the dates
    expectToHaveElementValue(data, /2020-03-\d\d \d\d:\d\d:\d\d$/m, 'table');

    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('displayLogHeader'));
    expect(getStdout(sfCommandStubs), 'stdout').to.contain(messages.getMessage('displayNoLogAvailable'));
  });

  it(`runs: --autoinstallid ${ID} -a (with app log)`, async () => {
    await stubDefaultOrg($$, testOrg);
    $$.fakeConnectionRequest = () =>
      Promise.resolve({
        ...autoInstallRequest,
        appFromRequest: {
          appLog: [{ message: 'App log message' }],
        },
      });

    await Display.run(['--autoinstallid', ID, '-a']);
    const { data, headers } = getTableData(sfCommandStubs);
    expect(headers, 'headers').to.deep.equal(['key', 'value']);
    expectToHaveElementInclude(data, { key: 'Id', value: ID }, 'table');
    expectToHaveElementInclude(data, { key: 'Created By', value: 'Automated Process' }, 'table');
    expectToHaveElementInclude(data, { key: 'Last Modified By', value: 'Automated Process' }, 'table');
    // just make sure it has least one of the dates
    expectToHaveElementValue(data, /2020-03-\d\d \d\d:\d\d:\d\d$/m, 'table');

    expect(getStyledHeaders(sfCommandStubs), 'styled headers').to.contain(messages.getMessage('displayLogHeader'));
    expect(getStdout(sfCommandStubs), 'stdout').to.not.contain(messages.getMessage('displayNoLogAvailable'));
    const { data: appLogData, headers: appLogHeaders } = getTableData(sfCommandStubs, 1);
    expect(appLogHeaders, 'headers').to.deep.equal(['message']);
    expectToHaveElementInclude(appLogData, { message: 'App log message' });
  });
});
