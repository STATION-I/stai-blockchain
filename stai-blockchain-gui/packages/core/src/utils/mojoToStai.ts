import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import staiFormatter from './staiFormatter';

export default function mojoToStai(mojo: string | number | BigNumber): BigNumber {
  return staiFormatter(mojo, Unit.MOJO)
    .to(Unit.STAI)
    .toBigNumber();
}