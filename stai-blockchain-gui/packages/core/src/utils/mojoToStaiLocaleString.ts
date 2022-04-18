import Big from 'big.js';
import Unit from '../constants/Unit';
import staiFormatter from './staiFormatter';

export default function mojoToStaiLocaleString(mojo: string | number | Big) {
  return staiFormatter(Number(mojo), Unit.MOJO)
    .to(Unit.STAI)
    .toLocaleString();
}