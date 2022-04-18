import PlotterName from './PlotterName';
import optionsForPlotter from '../utils/optionsForPlotter';
import defaultsForPlotter from '../utils/defaultsForPlotter';

export default {
  displayName: 'Stai Proof of Space',
  options: optionsForPlotter(PlotterName.STAIPOS),
  defaults: defaultsForPlotter(PlotterName.STAIPOS),
  installInfo: { installed: true },
};
