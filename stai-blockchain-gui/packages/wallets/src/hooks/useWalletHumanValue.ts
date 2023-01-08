import { useMemo } from 'react';
import type { Wallet } from '@stai/api';
import { WalletType } from '@stai/api';
import BigNumber from 'bignumber.js';
import { mojoToCATLocaleString, mojoToStaiLocaleString, useLocale } from '@stai/core';

export default function useWalletHumanValue(wallet: Wallet, value?: string | number | BigNumber, unit?: string): string {
  const [locale] = useLocale();
  
  return useMemo(() => {
    if (wallet && value !== undefined) {
      const localisedValue = wallet.type === WalletType.CAT
        ? mojoToCATLocaleString(value, locale)
        : mojoToStaiLocaleString(value, locale);

      return `${localisedValue} ${unit}`;
    }

    return '';
  }, [wallet, value, unit, locale]);
}
