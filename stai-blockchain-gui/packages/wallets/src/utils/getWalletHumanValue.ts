import type { Wallet } from '@stai/api';
import { WalletType } from '@stai/api';
import { mojoToCATLocaleString, mojoToStaiLocaleString } from '@stai/core';

export default function getWalletHumanValue(wallet: Wallet, value: number): string {
  return wallet.type === WalletType.CAT
    ? mojoToCATLocaleString(value)
    : mojoToStaiLocaleString(value);
}
