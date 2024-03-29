import React from 'react';
import { Trans } from '@lingui/macro';
import { FormatLargeNumber, CardSimple, StateColor } from '@stai/core';
import { useGetBlockchainStateQuery, useGetFullNodeConnectionsQuery } from '@stai/api-react';
import styled from 'styled-components';
import { recordMeasurement, resetSyncSpeedHeader } from '../FullNodeSyncSpeedHeader';

const StyledWarning = styled.span`
  color: ${StateColor.WARNING};
`;

/**
 * Get the highest height reported by full node peers.
 * 
 * Returns -1 if no full node peers are connected.
 * Returns -2 if at least 1 full node peer is connected, but none of them are reporting their height.
 */
function getPeakPeerHeight(connections) {
  if (connections === undefined) {
    return -1;
  }

  let peakPeerHeight = -1;
  let noBlankPeers = true;

  connections.forEach((connection) => {
    let peerHeight;

    //If connection isn't a full node...
    if (connection.type !== 1) {
      return; //...skip
    }

    peerHeight = connection.peakHeight;

    //Negative heights are to be treated as unreported heights.
    if (peerHeight === null || peerHeight < 0) {
      noBlankPeers = false;
      return;
    }

    if (peerHeight > peakPeerHeight) {
      peakPeerHeight = peerHeight;
    }
  });

  if(peakPeerHeight !== -1 || noBlankPeers) {
    return peakPeerHeight;
  } else {
    return -2;
  }
}

function printNotSynced(peakHeight, peakPeerHeight)
{
  resetSyncSpeedHeader();

  if (peakPeerHeight === -1) {
    return {
      value: <Trans>Not Connected to Peers</Trans>,
      color: 'error',
      tooltip: <Trans>The node is not connected to any full node peers and is therefore disconnected from the network</Trans>,
    };
  } else if (peakPeerHeight === -2) {
    return {
      value: <Trans>Not Enough Peer Info</Trans>,
      color: 'error',
      tooltip: <Trans>The node is not synced and none of the connected full node peer(s) are reporting their current height</Trans>,
    };
  } else if (peakHeight > peakPeerHeight) {
    return {
      value: (
        <Trans>
          Peer(s) Behind 
          <FormatLargeNumber value={peakHeight} />/<FormatLargeNumber value={peakPeerHeight} /> 
          (<FormatLargeNumber value={peakHeight - peakPeerHeight} /> ahead)
        </Trans>
      ),
      color: 'error',
      tooltip: <Trans>The node is not synced and is ahead of all it's connected full node peer(s)</Trans>,
    };
  } else if (peakHeight == peakPeerHeight) {
    return {
      value: <Trans>Peer(s) Stalled</Trans>,
      color: 'error',
      tooltip: <Trans>The node is not synced but also doesn't appear to be behind it's highest connected peer(s), meaning they might have stalled</Trans>,
    };
  }

  return {
    value: (
      <Trans>
        Not Synced 
        <FormatLargeNumber value={peakHeight} />/<FormatLargeNumber value={peakPeerHeight} /> 
        (<FormatLargeNumber value={peakPeerHeight - peakHeight} /> behind)
      </Trans>
    ),
    color: 'error',
    tooltip: <Trans>The node is not synced, and may be stuck itself</Trans>,
  };
}

function getData(state, connections) {
  let sync = state?.sync;
  let peakHeight = state?.peak?.height ?? 0;
  let peakPeerHeight = getPeakPeerHeight(connections);

  if (!sync) {
    return printNotSynced(peakHeight, peakPeerHeight);
  }

  if (sync.syncMode) {
    const progress = sync.syncProgressHeight;
    const tip = sync.syncTipHeight;

    //If a negative error code was returned or peers are behind...
    if(peakHeight > peakPeerHeight)
    {
      resetSyncSpeedHeader();
    }
    else
    {
      recordMeasurement(peakHeight, peakPeerHeight); //For sync speed measurement.
    }

    return {
      value: (
        <StyledWarning>
          <Trans>
            Syncing 
            <FormatLargeNumber value={progress} />/<FormatLargeNumber value={tip} /> 
            (<FormatLargeNumber value={tip - progress} /> behind)
          </Trans>
        </StyledWarning>
      ),
      color: 'error',
      tooltip: (
        <Trans>
          The node is syncing, which means it is downloading blocks from other
          nodes, to reach the latest block in the chain
        </Trans>
      ),
    };
  } else if (!sync.synced) {
    return printNotSynced(peakHeight, peakPeerHeight);
  } else {
    resetSyncSpeedHeader();

    return {
      value: <Trans>Synced</Trans>,
      color: 'primary',
      tooltip: (
        <Trans>This node is fully caught up and validating the network</Trans>
      ),
    };
  }
}

export default function FullNodeCardStatus() {
  const { data: state, isLoadingState, error } = useGetBlockchainStateQuery();
  const { data: connections, isLoadingConnections } = useGetFullNodeConnectionsQuery();

  if (isLoadingState || isLoadingConnections) {
    return <CardSimple loading title={<Trans>Status</Trans>} />;
  }

  const { value, tooltip, color } = getData(state, connections);

  return (
    <CardSimple
      valueColor={color}
      title={<Trans>Status</Trans>}
      tooltip={tooltip}
      value={value}
      error={error}
    />
  );
}
