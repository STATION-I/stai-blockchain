import Big from 'big.js';
import Unit from '../constants/Unit';
import staiFormatter from './staiFormatter';

export default function mojoToCATLocaleString(mojo: string | number | Big) {
  return staiFormatter(Number(mojo), Unit.MOJO)
    .to(Unit.CAT)
    .toLocaleString();
}