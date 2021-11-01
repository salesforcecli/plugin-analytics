/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { JsonMap } from '@salesforce/ts-types';
import { XmdType } from '../../../../src/lib/analytics/dataset/dataset';

// putting this in a seperate file since it's so big
export const xmdJson: XmdType & JsonMap = Object.freeze({
  createdBy: {
    id: '005xx000001XCD7AAO',
    name: 'User User',
    profilePhotoUrl: '/profilephoto/005/T'
  },
  createdDate: '2021-02-02T01:28:28.000Z',
  dataset: {
    connector: 'CSV',
    fullyQualifiedName: 'ABCWidgetSales2017_csv'
  },
  dates: [
    {
      alias: 'Year',
      fields: {
        day: 'Year_Day',
        epochDay: 'Year_day_epoch',
        epochSecond: 'Year_sec_epoch',
        fullField: 'Year',
        hour: 'Year_Hour',
        minute: 'Year_Minute',
        month: 'Year_Month',
        quarter: 'Year_Quarter',
        second: 'Year_Second',
        week: 'Year_Week',
        year: 'Year_Year'
      },
      firstDayOfWeek: -1,
      fiscalMonthOffset: 0,
      fullyQualifiedName: 'Year',
      isYearEndFiscalYear: true,
      label: 'Year',
      showInExplorer: true,
      type: 'Date'
    }
  ],
  derivedDimensions: [],
  derivedMeasures: [],
  dimensions: [
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Location_Name',
      fullyQualifiedName: 'Location_Name',
      isMultiValue: false,
      label: 'Location Name',
      linkTemplateEnabled: true,
      members: [],
      origin: 'Location_Name',
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Online_Code',
      fullyQualifiedName: 'Online_Code',
      isMultiValue: false,
      label: 'Online Code',
      linkTemplateEnabled: true,
      members: [],
      origin: 'Online_Code',
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Division_Name',
      fullyQualifiedName: 'Division_Name',
      isMultiValue: false,
      label: 'Division Name',
      linkTemplateEnabled: true,
      members: [],
      origin: 'Division_Name',
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'SVP',
      fullyQualifiedName: 'SVP',
      isMultiValue: false,
      label: 'SVP',
      linkTemplateEnabled: true,
      members: [],
      origin: 'SVP',
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Year',
      isMultiValue: false,
      label: 'Year',
      linkTemplateEnabled: true,
      members: [],
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Year_Year',
      isMultiValue: false,
      label: 'Year_Year',
      linkTemplateEnabled: true,
      members: [],
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Year_Quarter',
      isMultiValue: false,
      label: 'Year_Quarter',
      linkTemplateEnabled: true,
      members: [],
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Year_Month',
      isMultiValue: false,
      label: 'Year_Month',
      linkTemplateEnabled: true,
      members: [],
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Year_Week',
      isMultiValue: false,
      label: 'Year_Week',
      linkTemplateEnabled: true,
      members: [],
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Year_Day',
      isMultiValue: false,
      label: 'Year_Day',
      linkTemplateEnabled: true,
      members: [],
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Year_Hour',
      isMultiValue: false,
      label: 'Year_Hour',
      linkTemplateEnabled: true,
      members: [],
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Year_Minute',
      isMultiValue: false,
      label: 'Year_Minute',
      linkTemplateEnabled: true,
      members: [],
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Year_Second',
      isMultiValue: false,
      label: 'Year_Second',
      linkTemplateEnabled: true,
      members: [],
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {
        chartColor: {
          parameters: {
            values: [
              {
                formatValue: '#7D98B3',
                value: 'AK'
              },
              {
                formatValue: '#98B1FF',
                value: 'AL'
              },
              {
                formatValue: '#B3B400',
                value: 'CO'
              },
              {
                formatValue: '#B56200',
                value: 'AZ'
              }
            ]
          },
          referenceField: 'State',
          type: 'categories'
        }
      },
      customActions: [],
      customActionsEnabled: true,
      field: 'State',
      fullyQualifiedName: 'State',
      isMultiValue: false,
      label: 'State',
      linkTemplateEnabled: false,
      members: [],
      origin: 'State',
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: false,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'AVP',
      fullyQualifiedName: 'AVP',
      isMultiValue: false,
      label: 'AVP',
      linkTemplateEnabled: true,
      members: [],
      origin: 'AVP',
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      customActions: [],
      customActionsEnabled: true,
      field: 'Location_Description',
      fullyQualifiedName: 'Location_Description',
      isMultiValue: false,
      label: 'Location Description',
      linkTemplateEnabled: true,
      members: [],
      origin: 'Location_Description',
      recordDisplayFields: [],
      salesforceActions: [],
      salesforceActionsEnabled: true,
      showInExplorer: true
    }
  ],
  language: 'en_US',
  lastModifiedBy: {
    id: '005xx000001XCD7AAO',
    name: 'User User',
    profilePhotoUrl: '/profilephoto/005/T'
  },
  lastModifiedDate: '2021-02-02T01:28:28.000Z',
  measures: [
    {
      conditionalFormatting: {},
      field: 'Regular_GM',
      format: {
        decimalDigits: 2,
        delimiters: {}
      },
      fullyQualifiedName: 'Regular_GM',
      label: 'Regular GM',
      origin: 'Regular_GM',
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      field: 'Adjusted_COGS',
      format: {
        decimalDigits: 2,
        delimiters: {}
      },
      fullyQualifiedName: 'Adjusted_COGS',
      label: 'Adjusted COGS',
      origin: 'Adjusted_COGS',
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      field: 'Total_GM',
      format: {
        decimalDigits: 2,
        delimiters: {}
      },
      fullyQualifiedName: 'Total_GM',
      label: 'Total GM',
      origin: 'Total_GM',
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      field: 'DIVISION_NUM',
      format: {
        decimalDigits: 0,
        delimiters: {}
      },
      fullyQualifiedName: 'DIVISION_NUM',
      label: 'DIVISION_NUM',
      origin: 'DIVISION_NUM',
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      field: 'Sales',
      format: {
        customFormat: '["#,##0.00",1]',
        decimalDigits: 2,
        delimiters: {
          decimal: '.',
          thousands: ','
        }
      },
      fullyQualifiedName: 'Sales',
      label: 'Sales',
      origin: 'Sales',
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      field: 'Year_day_epoch',
      format: {
        delimiters: {}
      },
      label: 'Year_day_epoch',
      showInExplorer: true
    },
    {
      conditionalFormatting: {},
      field: 'Year_sec_epoch',
      format: {
        delimiters: {}
      },
      label: 'Year_sec_epoch',
      showInExplorer: true
    }
  ],
  organizations: [],
  showDetailsDefaultFields: [],
  type: 'main',
  url: '/services/data/v52.0/wave/datasets/0Fbxx0000004CyeCAE/versions/0Fcxx0000004CsCCAU/xmds/main'
});