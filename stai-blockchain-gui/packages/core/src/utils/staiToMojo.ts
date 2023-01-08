import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import staiFormatter from './staiFormatter';

export default function staiToMojo(stai: string | number | BigNumber): BigNumber {
  return staiFormatter(stai, Unit.STAI)
    .to(Unit.MOJO)
    .toBigNumber();
}