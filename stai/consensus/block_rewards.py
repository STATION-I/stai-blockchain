from stai.util.ints import uint32, uint64

# 1 stai coin = 1,000,000,000 = 1 billion mojo.
_mojo_per_stai = 1000000000
_blocks_per_year = 1681920  # 32 * 6 * 24 * 365


def calculate_pool_reward(height: uint32) -> uint64:
    """
    Returns the pool reward at a certain block height. The pool earns 4/5 of the reward in each block. If the farmer
    is solo farming, they act as the pool, and therefore earn the entire block reward.
    These halving events will not be hit at the exact times
    (3 years, etc), due to fluctuations in difficulty. They will likely come early, if the network space and VDF
    rates increase continuously.
    """

    if height == 0:
        return uint64(int((992 / 1000) * 55882000 * _mojo_per_stai))
    elif height < 1 * _blocks_per_year:
        return uint64(int((4 / 5) * 5 * _mojo_per_stai))
    elif height < 2 * _blocks_per_year:
        return uint64(int((2 / 2.5) * 2.5 * _mojo_per_stai))
    else:
        return uint64(int((1 / 1.25) * 1.25 * _mojo_per_stai))


def calculate_base_farmer_reward(height: uint32) -> uint64:
    """
    Returns the base farmer reward at a certain block height.
    The base fee reward is 1/5 of total block reward

    Returns the coinbase reward at a certain block height. These halving events will not be hit at the exact times
    (3 years, etc), due to fluctuations in difficulty. They will likely come early, if the network space and VDF
    rates increase continuously. Bonus to the dev who contributed starting the blockchain !
    """
    if height == 0:
        return uint64(int((8 / 1000) * 55882000 * _mojo_per_stai))
    elif height < 1 * _blocks_per_year:
        return uint64(int((1 / 5) * 5 * _mojo_per_stai))
    elif height < 2 * _blocks_per_year:
        return uint64(int((1 / 2.5) * 2.5 * _mojo_per_stai))
    else:
        return uint64(int((1 / 1.25) * 1.25 * _mojo_per_stai))

def calculate_base_officialwallets_reward(height: uint32) -> uint64:
    """
    Community Rewards: 1 stai every block at stage 1 & 2 & 3
    """
    if height == 0:
        return uint64(int((1 / 6) * 0 * _mojo_per_stai))
    elif height < 1 * _blocks_per_year:
        return uint64(int((1 / 6) * 6 * _mojo_per_stai))
    elif height < 2 * _blocks_per_year:
        return uint64(int((1 / 3) * 3 * _mojo_per_stai))
    else:
        return uint64(int((1 / 2) * 2 * _mojo_per_stai))
