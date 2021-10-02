import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../modules/rootReducer';
import FarmCard from './FarmCard';
import { mojo_to_staicoin } from '../../../util/staicoin';
import useCurrencyCode from '../../../hooks/useCurrencyCode';
import { FormatLargeNumber } from '@staicoin/core';

export default function FarmCardTotalstaicoinFarmed() {
  const currencyCode = useCurrencyCode();

  const loading = useSelector(
    (state: RootState) => !state.wallet_state.farmed_amount,
  );

  const farmedAmount = useSelector(
    (state: RootState) => state.wallet_state.farmed_amount?.farmed_amount,
  );

  const totalstaicoinFarmed = useMemo(() => {
    if (farmedAmount !== undefined) {
      const val = BigInt(farmedAmount.toString());
      return mojo_to_staicoin(val);
    }
  }, [farmedAmount]);

  return (
    <FarmCard
      title={<Trans>{currencyCode} Total staicoin Farmed</Trans>}
      value={<FormatLargeNumber value={totalstaicoinFarmed} />}
      loading={loading}
    />
  );
}
