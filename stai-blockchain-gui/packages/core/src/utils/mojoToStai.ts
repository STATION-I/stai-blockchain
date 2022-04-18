import Big from 'big.js';
import Unit from '../constants/Unit';
import staiFormatter from './staiFormatter';

export default function mojoToStai(mojo: string | number | Big): number {
  return staiFormatter(mojo, Unit.MOJO)
    .to(Unit.STAI)
    .toNumber();
}