import Big from 'big.js';
import Unit from '../constants/Unit';
import staiFormatter from './staiFormatter';

export default function mojoToCAT(mojo: string | number | Big): number {
  return staiFormatter(mojo, Unit.MOJO)
    .to(Unit.CAT)
    .toNumber();
}