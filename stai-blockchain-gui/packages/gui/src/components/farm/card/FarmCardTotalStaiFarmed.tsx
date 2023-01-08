import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useCurrencyCode, mojoToStaiLocaleString, CardSimple, useLocale } from '@stai/core';
import { useGetFarmedAmountQuery } from '@stai/api-react';

export default function FarmCardTotalStaiFarmed() {
  const currencyCode = useCurrencyCode();
  const [locale] = useLocale();
  const { data, isLoading, error } = useGetFarmedAmountQuery();

  const farmedAmount = data?.farmedAmount;

  const totalStaiFarmed = useMemo(() => {
    if (farmedAmount !== undefined) {
      return (
        <>
          {mojoToStaiLocaleString(farmedAmount, locale)}
          &nbsp;
          {currencyCode}
        </>
      );
    }
  }, [farmedAmount, locale, currencyCode]);

  return (
    <CardSimple
      title={<Trans>Total STAI Farmed</Trans>}
      value={totalStaiFarmed}
      loading={isLoading}
      error={error}
    />
  );
}
