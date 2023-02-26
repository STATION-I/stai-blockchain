import React from 'react';
import { Trans } from '@lingui/macro';
import { useGetBlockchainStateQuery } from '@stai/api-react';
import moment from 'moment';
import { ButtonGroup, Button } from '@mui/material';
import { TooltipIcon, Flex } from '@stai/core';

global.syncSpeedMeasurement1 = null;
global.syncSpeedMeasurement2 = null;

const syncSpeedCounterSize = 10;
global.syncSpeedCounterValue = syncSpeedCounterSize;

//Looping Counter Function
function useCounter() {
  syncSpeedCounterValue = (syncSpeedCounterValue + 1) % syncSpeedCounterSize;
  return syncSpeedCounterValue;
}

export function recordMeasurement(peakHeight, peakPeerHeight)
{
  let timestamp = Date.now() //Unix Timestamp in Milliseconds

  if (useCounter() === 0) {
    //If measurement 2 is defined...
    if (syncSpeedMeasurement2 !== null) {
      syncSpeedMeasurement1 = {...syncSpeedMeasurement2}; //Copy measurement 2 into measurement 1.
    }

    syncSpeedMeasurement2 = {
      peakHeight: peakHeight,
      peakPeerHeight: peakPeerHeight,
      timestamp: timestamp,
    };
  }
}

export function resetSyncSpeedHeader()
{
  syncSpeedMeasurement1 = null;
  syncSpeedMeasurement2 = null;
}

export default function FullNodeSyncSpeedHeader() {
  const networkBlockRate = 3.2 //Blocks per Minute
  const blank = (<ButtonGroup variant="outlined" color="secondary" size="small" />);

  useGetBlockchainStateQuery(); //Used to update with the status card.

  //If one of the measurements are empty...
  if (syncSpeedMeasurement1 === null || syncSpeedMeasurement2 === null) {
    return blank;
  }

  let peakHeight1 = syncSpeedMeasurement1.peakHeight;
  let timestamp1 = syncSpeedMeasurement1.timestamp;

  let peakHeight2 = syncSpeedMeasurement2.peakHeight;
  let timestamp2 = syncSpeedMeasurement2.timestamp;

  let peakPeerHeight = syncSpeedMeasurement2.peakPeerHeight;

  let blocksSynced = peakHeight2 - peakHeight1;
  let timeRange = timestamp2 - timestamp1; //Milliseconds
  let minutes = timeRange / 60000;

  if (minutes === 0) {
    return blank;
  }

  let catchupSpeed = blocksSynced / minutes - networkBlockRate; //Blocks per Minute;

  let blocksPerMinute;
  let expectedTimeToSync;

  if (blocksSynced === 0) {
    blocksPerMinute = 0;
    expectedTimeToSync = 'Never';
  } else if (blocksSynced > 0) {
    blocksPerMinute = catchupSpeed.toFixed(2)
    let timeLeft = (peakPeerHeight - peakHeight2) / catchupSpeed;

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
