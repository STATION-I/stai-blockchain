import Big from 'big.js';
import Unit from '../constants/Unit';
import staiFormatter from './staiFormatter';

export default function staiToMojo(stai: string | number | Big): number {
  return staiFormatter(stai, Unit.STAI)
    .to(Unit.MOJO)
    .toNumber();
}