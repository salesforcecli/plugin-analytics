/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { JsonMap } from '@salesforce/ts-types';
import { DatasetType, SourceObjectFieldsType } from '../../../../src/lib/analytics/dataset/dataset';
import { QueryResults } from '../../../../src/lib/analytics/query/query';

export const liveDatasetJson: DatasetType & JsonMap = Object.freeze({
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
});

export const liveDatasetFieldsJson: SourceObjectFieldsType & JsonMap = Object.freeze({
  fields: [
    {
      fieldType: 'date',
      format: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
      name: 'YEAR_MONTH'
    },
    {
      fieldType: 'text',
      name: 'CARRIER_NAME',
      precision: 32000
    },
    {
      fieldType: 'text',
      name: 'AIRPORT_NAME',
      precision: 32000
    },
    {
      fieldType: 'numeric',
      name: 'FLIGHTS',
      precision: 18,
      scale: 0
    },
    {
      fieldType: 'numeric',
      name: 'DELAYS',
      precision: 18,
      scale: 0
    },
    {
      fieldType: 'numeric',
      name: 'PCT_DELAYED',
      precision: 18,
      scale: 9
    },
    {
      fieldType: 'numeric',
      name: 'CARRIER_CT',
      precision: 18,
      scale: 2
    },
    {
      fieldType: 'numeric',
      name: 'PCT_DELAYED_CARRIER',
      precision: 18,
      scale: 9
    },
    {
      fieldType: 'numeric',
      name: 'WEATHER_CT',
      precision: 18,
      scale: 2
    },
    {
      fieldType: 'numeric',
      name: 'PCT_DELAYED_WEATHER',
      precision: 18,
      scale: 9
    },
    {
      fieldType: 'numeric',
      name: 'NAS_CT',
      precision: 18,
      scale: 2
    },
    {
      fieldType: 'numeric',
      name: 'PCT_DELAYED_NAS',
      precision: 18,
      scale: 9
    },
    {
      fieldType: 'numeric',
      name: 'SECURITY_CT',
      precision: 18,
      scale: 2
    },
    {
      fieldType: 'numeric',
      name: 'PCT_DELAYED_SECURITY',
      precision: 18,
      scale: 9
    },
    {
      fieldType: 'numeric',
      name: 'LATE_AIRCRAFT_CT',
      precision: 18,
      scale: 2
    },
    {
      fieldType: 'numeric',
      name: 'PCT_DELAYED_AIRCRAFT',
      precision: 18,
      scale: 9
    },
    {
      fieldType: 'numeric',
      name: 'ARR_CANCELLED',
      precision: 18,
      scale: 0
    },
    {
      fieldType: 'numeric',
      name: 'ARR_DIVERTED',
      precision: 18,
      scale: 0
    },
    {
      fieldType: 'numeric',
      name: 'ARR_DELAY',
      precision: 18,
      scale: 0
    },
    {
      fieldType: 'numeric',
      name: 'CARRIER_DELAY',
      precision: 18,
      scale: 0
    },
    {
      fieldType: 'numeric',
      name: 'PCT_TIME_DELAYED_CARRIER',
      precision: 18,
      scale: 9
    },
    {
      fieldType: 'numeric',
      name: 'WEATHER_DELAY',
      precision: 18,
      scale: 0
    },
    {
      fieldType: 'numeric',
      name: 'PCT_TIME_DELAYED_WEATHER',
      precision: 18,
      scale: 9
    },
    {
      fieldType: 'numeric',
      name: 'NAS_DELAY',
      precision: 18,
      scale: 0
    },
    {
      fieldType: 'numeric',
      name: 'PCT_TIME_DELAYED_NAS',
      precision: 18,
      scale: 9
    },
    {
      fieldType: 'numeric',
      name: 'SECURITY_DELAY',
      precision: 18,
      scale: 0
    },
    {
      fieldType: 'numeric',
      name: 'PCT_TIME_DELAYED_SECURITY',
      precision: 18,
      scale: 9
    },
    {
      fieldType: 'numeric',
      name: 'LATE_AIRCRAFT_DELAY',
      precision: 18,
      scale: 0
    },
    {
      fieldType: 'numeric',
      name: 'PCT_TIME_DELAYED_AIRCRAFT',
      precision: 18,
      scale: 9
    }
  ],
  url: '/services/data/v53.0/wave/dataConnectors/SnowflakeOne/sourceObjects/AIRLINE_DELAYS/fields'
});

export const liveSqlResponseJson: QueryResults & JsonMap = Object.freeze({
  metadata: {
    columns: [
      {
        label: 'YEAR_MONTH',
        type: 'date'
      },
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
      },
      {
        label: 'WEATHER_CT',
        type: 'numeric'
      },
      {
        label: 'PCT_DELAYED_WEATHER',
        type: 'numeric'
      },
      {
        label: 'NAS_CT',
        type: 'numeric'
      },
      {
        label: 'PCT_DELAYED_NAS',
        type: 'numeric'
      },
      {
        label: 'SECURITY_CT',
        type: 'numeric'
      },
      {
        label: 'PCT_DELAYED_SECURITY',
        type: 'numeric'
      },
      {
        label: 'LATE_AIRCRAFT_CT',
        type: 'numeric'
      },
      {
        label: 'PCT_DELAYED_AIRCRAFT',
        type: 'numeric'
      },
      {
        label: 'ARR_CANCELLED',
        type: 'numeric'
      },
      {
        label: 'ARR_DIVERTED',
        type: 'numeric'
      },
      {
        label: 'ARR_DELAY',
        type: 'numeric'
      },
      {
        label: 'CARRIER_DELAY',
        type: 'numeric'
      },
      {
        label: 'PCT_TIME_DELAYED_CARRIER',
        type: 'numeric'
      },
      {
        label: 'WEATHER_DELAY',
        type: 'numeric'
      },
      {
        label: 'PCT_TIME_DELAYED_WEATHER',
        type: 'numeric'
      },
      {
        label: 'NAS_DELAY',
        type: 'numeric'
      },
      {
        label: 'PCT_TIME_DELAYED_NAS',
        type: 'numeric'
      },
      {
        label: 'SECURITY_DELAY',
        type: 'numeric'
      },
      {
        label: 'PCT_TIME_DELAYED_SECURITY',
        type: 'numeric'
      },
      {
        label: 'LATE_AIRCRAFT_DELAY',
        type: 'numeric'
      },
      {
        label: 'PCT_TIME_DELAYED_AIRCRAFT',
        type: 'numeric'
      }
    ]
  },
  records: [
    {
      YEAR_MONTH: '2007-12-31',
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Albuquerque  NM: Albuquerque International Sunport',
      FLIGHTS: 246,
      DELAYS: 26,
      PCT_DELAYED: 0.105691057,
      CARRIER_CT: 10.93,
      PCT_DELAYED_CARRIER: 0.420384615,
      WEATHER_CT: 0.19,
      PCT_DELAYED_WEATHER: 0.007307692,
      NAS_CT: 6.61,
      PCT_DELAYED_NAS: 0.254230769,
      SECURITY_CT: 0,
      PCT_DELAYED_SECURITY: 0,
      LATE_AIRCRAFT_CT: 8.28,
      PCT_DELAYED_AIRCRAFT: 0.318461538,
      ARR_CANCELLED: 7,
      ARR_DIVERTED: 1,
      ARR_DELAY: 1063,
      CARRIER_DELAY: 600,
      PCT_TIME_DELAYED_CARRIER: 0.564440263,
      WEATHER_DELAY: 5,
      PCT_TIME_DELAYED_WEATHER: 0.004703669,
      NAS_DELAY: 179,
      PCT_TIME_DELAYED_NAS: 0.168391345,
      SECURITY_DELAY: 0,
      PCT_TIME_DELAYED_SECURITY: 0,
      LATE_AIRCRAFT_DELAY: 279,
      PCT_TIME_DELAYED_AIRCRAFT: 0.262464722
    },
    {
      YEAR_MONTH: '2007-12-31',
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Atlanta  GA: Hartsfield-Jackson Atlanta International',
      FLIGHTS: 488,
      DELAYS: 69,
      PCT_DELAYED: 0.141393443,
      CARRIER_CT: 35.13,
      PCT_DELAYED_CARRIER: 0.509130435,
      WEATHER_CT: 0.77,
      PCT_DELAYED_WEATHER: 0.01115942,
      NAS_CT: 23.93,
      PCT_DELAYED_NAS: 0.346811594,
      SECURITY_CT: 0,
      PCT_DELAYED_SECURITY: 0,
      LATE_AIRCRAFT_CT: 9.18,
      PCT_DELAYED_AIRCRAFT: 0.133043478,
      ARR_CANCELLED: 15,
      ARR_DIVERTED: 3,
      ARR_DELAY: 2956,
      CARRIER_DELAY: 1799,
      PCT_TIME_DELAYED_CARRIER: 0.608592693,
      WEATHER_DELAY: 68,
      PCT_TIME_DELAYED_WEATHER: 0.02300406,
      NAS_DELAY: 673,
      PCT_TIME_DELAYED_NAS: 0.22767253,
      SECURITY_DELAY: 0,
      PCT_TIME_DELAYED_SECURITY: 0,
      LATE_AIRCRAFT_DELAY: 416,
      PCT_TIME_DELAYED_AIRCRAFT: 0.140730717
    },
    {
      YEAR_MONTH: '2007-12-31',
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Austin  TX: Austin - Bergstrom International',
      FLIGHTS: 580,
      DELAYS: 102,
      PCT_DELAYED: 0.175862069,
      CARRIER_CT: 43.99,
      PCT_DELAYED_CARRIER: 0.43127451,
      WEATHER_CT: 3.95,
      PCT_DELAYED_WEATHER: 0.03872549,
      NAS_CT: 23.68,
      PCT_DELAYED_NAS: 0.232156863,
      SECURITY_CT: 0,
      PCT_DELAYED_SECURITY: 0,
      LATE_AIRCRAFT_CT: 30.38,
      PCT_DELAYED_AIRCRAFT: 0.297843137,
      ARR_CANCELLED: 9,
      ARR_DIVERTED: 1,
      ARR_DELAY: 4040,
      CARRIER_DELAY: 1749,
      PCT_TIME_DELAYED_CARRIER: 0.432920792,
      WEATHER_DELAY: 299,
      PCT_TIME_DELAYED_WEATHER: 0.074009901,
      NAS_DELAY: 690,
      PCT_TIME_DELAYED_NAS: 0.170792079,
      SECURITY_DELAY: 0,
      PCT_TIME_DELAYED_SECURITY: 0,
      LATE_AIRCRAFT_DELAY: 1302,
      PCT_TIME_DELAYED_AIRCRAFT: 0.322277228
    },
    {
      YEAR_MONTH: '2007-12-31',
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Hartford  CT: Bradley International',
      FLIGHTS: 155,
      DELAYS: 37,
      PCT_DELAYED: 0.238709677,
      CARRIER_CT: 19.38,
      PCT_DELAYED_CARRIER: 0.523783784,
      WEATHER_CT: 0.9,
      PCT_DELAYED_WEATHER: 0.024324324,
      NAS_CT: 10.72,
      PCT_DELAYED_NAS: 0.28972973,
      SECURITY_CT: 0,
      PCT_DELAYED_SECURITY: 0,
      LATE_AIRCRAFT_CT: 6,
      PCT_DELAYED_AIRCRAFT: 0.162162162,
      ARR_CANCELLED: 2,
      ARR_DIVERTED: 0,
      ARR_DELAY: 1457,
      CARRIER_DELAY: 734,
      PCT_TIME_DELAYED_CARRIER: 0.50377488,
      WEATHER_DELAY: 77,
      PCT_TIME_DELAYED_WEATHER: 0.052848318,
      NAS_DELAY: 270,
      PCT_TIME_DELAYED_NAS: 0.185312286,
      SECURITY_DELAY: 0,
      PCT_TIME_DELAYED_SECURITY: 0,
      LATE_AIRCRAFT_DELAY: 376,
      PCT_TIME_DELAYED_AIRCRAFT: 0.258064516
    },
    {
      YEAR_MONTH: '2007-12-31',
      CARRIER_NAME: 'American Airlines Inc.',
      AIRPORT_NAME: 'Birmingham  AL: Birmingham-Shuttlesworth International',
      FLIGHTS: 88,
      DELAYS: 19,
      PCT_DELAYED: 0.215909091,
      CARRIER_CT: 6.52,
      PCT_DELAYED_CARRIER: 0.343157895,
      WEATHER_CT: 2.28,
      PCT_DELAYED_WEATHER: 0.12,
      NAS_CT: 5.64,
      PCT_DELAYED_NAS: 0.296842105,
      SECURITY_CT: 0,
      PCT_DELAYED_SECURITY: 0,
      LATE_AIRCRAFT_CT: 4.56,
      PCT_DELAYED_AIRCRAFT: 0.24,
      ARR_CANCELLED: 1,
      ARR_DIVERTED: 0,
      ARR_DELAY: 731,
      CARRIER_DELAY: 307,
      PCT_TIME_DELAYED_CARRIER: 0.41997264,
      WEATHER_DELAY: 94,
      PCT_TIME_DELAYED_WEATHER: 0.128590971,
      NAS_DELAY: 149,
      PCT_TIME_DELAYED_NAS: 0.203830369,
      SECURITY_DELAY: 0,
      PCT_TIME_DELAYED_SECURITY: 0,
      LATE_AIRCRAFT_DELAY: 181,
      PCT_TIME_DELAYED_AIRCRAFT: 0.247606019
    }
  ]
});
