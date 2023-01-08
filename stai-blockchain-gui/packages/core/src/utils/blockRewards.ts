import BigNumber from 'bignumber.js';

const MOJO_PER_STAI = new BigNumber('1000000000');
const BLOCKS_PER_YEAR = 1681920;
const POOL_REWARD = '1'; // 7 / 8
const FARMER_REWARD = '1'; // 1 /8

export function calculatePoolReward(height: number): BigNumber {
  if (height === 0) {
    return MOJO_PER_STAI.times('55434944').times(POOL_REWARD);
  }
  if (height < 1 * BLOCKS_PER_YEAR) {
    return MOJO_PER_STAI.times('4').times(POOL_REWARD);
  }
  if (height < 2 * BLOCKS_PER_YEAR) {
    return MOJO_PER_STAI.times('2').times(POOL_REWARD);
  }

  return MOJO_PER_STAI.times('1').times(POOL_REWARD);
}

export function calculateBaseFarmerReward(height: number): BigNumber {
  if (height === 0) {
    return MOJO_PER_STAI.times('447056').times(FARMER_REWARD);
  }
  if (height < 1 * BLOCKS_PER_YEAR) {
    return MOJO_PER_STAI.times('1').times(FARMER_REWARD);
  }
  if (height < 2 * BLOCKS_PER_YEAR) {
    return MOJO_PER_STAI.times('1').times(FARMER_REWARD);
  }

  return MOJO_PER_STAI.times('1').times(FARMER_REWARD);
}

export function calculateOfficialWalletsReward(height: number): BigNumber {
  if (height === 0) {
    return MOJO_PER_STAI.times('0');
  }

  return MOJO_PER_STAI.times('1');
}

