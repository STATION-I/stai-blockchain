import Big from 'big.js';
import Unit from '../constants/Unit';
import staiFormatter from './staiFormatter';

export default function catToMojo(cat: string | number | Big): number {
  return staiFormatter(cat, Unit.CAT)
    .to(Unit.MOJO)
    .toNumber();
}