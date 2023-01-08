import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import staiFormatter from './staiFormatter';

export default function catToMojo(cat: string | number | BigNumber): BigNumber {
  return staiFormatter(cat, Unit.CAT)
    .to(Unit.MOJO)
    .toBigNumber();
}