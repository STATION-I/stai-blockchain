import { WalletType } from '@stai/api';
import type { Wallet } from '@stai/api';

export default function getWalletPrimaryTitle(wallet: Wallet): string {
  switch (wallet.type) {
    case WalletType.STANDARD_WALLET:
      return 'STAI';
    default:
      return wallet.name;
  }
}
