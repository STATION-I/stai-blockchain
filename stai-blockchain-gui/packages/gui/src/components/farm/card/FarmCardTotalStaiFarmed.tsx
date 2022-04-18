import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useCurrencyCode, mojoToStaiLocaleString, CardSimple } from '@stai/core';
import { useGetFarmedAmountQuery } from '@stai/api-react';

export default function FarmCardTotalStaiFarmed() {
  const currencyCode = useCurrencyCode();
  const { data, isLoading, error } = useGetFarmedAmountQuery();

  const farmedAmount = data?.farmedAmount;

  const totalStaiFarmed = useMemo(() => {
    if (farmedAmount !== undefined) {
      return (
        <>
          {mojoToStaiLocaleString(farmedAmount)}
          &nbsp;
          {currencyCode}
        </>
      );
    }
  }, [farmedAmount]);

  return (
    <CardSimple
      title={<Trans>Total Stai Farmed</Trans>}
      value={totalStaiFarmed}
      loading={isLoading}
      error={error}
    />
  );
}
