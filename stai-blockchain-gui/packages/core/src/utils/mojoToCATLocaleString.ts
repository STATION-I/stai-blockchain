import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import staiFormatter from './staiFormatter';

export default function mojoToCATLocaleString(mojo: string | number | BigNumber, locale?: string) {
  return staiFormatter(mojo, Unit.MOJO)
    .to(Unit.CAT)
    .toLocaleString(locale);
}
