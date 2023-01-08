import React from 'react';
import { Trans } from '@lingui/macro';
import { useGetBlockchainStateQuery } from '@stai/api-react';
import moment from 'moment';
import { ButtonGroup, Button } from '@mui/material';
import { TooltipIcon, Flex } from '@stai/core';

global.syncSpeedMeasurement1 = null;//emptySyncSpeedMeasurement;
global.syncSpeedMeasurement2 = null;//emptySyncSpeedMeasurement;

const syncSpeedCounterSize = 10;
global.syncSpeedCounterValue = syncSpeedCounterSize;

//Looping Counter Function
function useCounter() {
  syncSpeedCounterValue = (syncSpeedCounterValue + 1) % syncSpeedCounterSize;
  return syncSpeedCounterValue;
}

export function recordMeasurement(blocksBehind)
{
  let timestamp = Date.now() //Unix Timestamp in Milliseconds

  if (blocksBehind === null) {
    syncSpeedMeasurement1 = null;
    syncSpeedMeasurement2 = null;

    syncSpeedCounterValue = syncSpeedCounterSize;
  } else if (useCounter() === 0) {
    //If there is no measurement 2...
    if (syncSpeedMeasurement2 !== null) {
      syncSpeedMeasurement1 = {...syncSpeedMeasurement2}; //Copy measurement 2 into measurement 1.
    }

    syncSpeedMeasurement2 = {
      blocksBehind: blocksBehind,
      timestamp: timestamp,
    };
  }
}

export default function FullNodeSyncSpeedHeader() {
  const blank = (<ButtonGroup variant="outlined" color="secondary" size="small" />);

  useGetBlockchainStateQuery(); //Used to update with the status card.

  //If the node was not in sync mode in either measurement...
  if (syncSpeedMeasurement1 === null || syncSpeedMeasurement2 === null) {
    return blank;
  }

  let blocksBehind1 = syncSpeedMeasurement1.blocksBehind;
  let timestamp1 = syncSpeedMeasurement1.timestamp;

  let blocksBehind2 = syncSpeedMeasurement2.blocksBehind;
  let timestamp2 = syncSpeedMeasurement2.timestamp;

  let progress = blocksBehind1 - blocksBehind2;
  let timeRange = timestamp2 - timestamp1;
  let minutes = timeRange / 60000;

  if (minutes === 0) {
    return blank;
  }

  let speed = progress / minutes;
  let blocksPerMinute;
  let expectedTimeToSync;

  if (progress === 0) {
    blocksPerMinute = 0;
    expectedTimeToSync = 'Never';
  } else if (progress > 0) {
    blocksPerMinute = speed.toFixed(2)
    let timeLeft = blocksBehind2 / speed;

    expectedTimeToSync = moment.duration({
      minutes: timeLeft,
    }).humanize();
  } else {
    return blank;
  }

  return (
    <Flex gap={1} alignItems="center">
      <TooltipIcon>Estimated catch-up speed and time to fully sync</TooltipIcon>
      <ButtonGroup variant="outlined" color="secondary" size="small">
        <Button>
          <Trans>{blocksPerMinute} block(s)/minute</Trans>
        </Button>
        <Button>
          <Trans>ETS: {expectedTimeToSync}</Trans>
        </Button>
      </ButtonGroup>
    </Flex>
  );
}
