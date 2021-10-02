import asyncio

from blspy import G2Element
from clvm_tools import binutils

from staicoin.consensus.block_rewards import calculate_base_officialwallets_reward, calculate_base_farmer_reward, calculate_pool_reward
from staicoin.rpc.full_node_rpc_client import FullNodeRpcClient
from staicoin.types.blockchain_format.program import Program
from staicoin.types.coin_spend import CoinSpend
from staicoin.types.condition_opcodes import ConditionOpcode
from staicoin.types.spend_bundle import SpendBundle
from staicoin.util.bech32m import decode_puzzle_hash
from staicoin.util.condition_tools import parse_sexp_to_conditions
from staicoin.util.config import load_config
from staicoin.util.default_root import DEFAULT_ROOT_PATH
from staicoin.util.ints import uint32, uint16


def print_conditions(spend_bundle: SpendBundle):
    print("\nConditions:")
    for coin_spend in spend_bundle.coin_spends:
        result = Program.from_bytes(bytes(coin_spend.puzzle_reveal)).run(Program.from_bytes(bytes(coin_spend.solution)))
        error, result_human = parse_sexp_to_conditions(result)
        assert error is None
        assert result_human is not None
        for cvp in result_human:
            print(f"{ConditionOpcode(cvp.opcode).name}: {[var.hex() for var in cvp.vars]}")
    print("")


async def main() -> None:
    rpc_port: uint16 = uint16(8555)
    self_hostname = "localhost"
    path = DEFAULT_ROOT_PATH
    config = load_config(path, "config.yaml")
    client = await FullNodeRpcClient.create(self_hostname, rpc_port, path, config)
    try:
        officialwallets_prefarm = (await client.get_block_record_by_height(1)).reward_claims_incorporated[2]
        farmer_prefarm = (await client.get_block_record_by_height(1)).reward_claims_incorporated[1]
        pool_prefarm = (await client.get_block_record_by_height(1)).reward_claims_incorporated[0]

        pool_amounts = int(calculate_pool_reward(uint32(0)) / 2)
        farmer_amounts = int(calculate_base_farmer_reward(uint32(0)) / 2)
        officialwallets_amounts = int(calculate_base_officialwallets_reward(uint32(0)) / 2)
        print(farmer_prefarm.amount, farmer_amounts)
        assert farmer_amounts == farmer_prefarm.amount // 2
        assert pool_amounts == pool_prefarm.amount // 2
        assert officialwallets_amounts == officialwallets_prefarm.amount // 2
        address1 = "stai135ztetmkx6wjw0zv305mg03efwx09575jl7fufy8cqsq52v2s9zq3yc0jf"  # Key 1
        address2 = "stai135ztetmkx6wjw0zv305mg03efwx09575jl7fufy8cqsq52v2s9zq3yc0jf"  # Key 2
        address2 = "stai135ztetmkx6wjw0zv305mg03efwx09575jl7fufy8cqsq52v2s9zq3yc0jf"  # Key 2

        ph1 = decode_puzzle_hash(address1)
        ph2 = decode_puzzle_hash(address2)
        ph3 = decode_puzzle_hash(address3)

        p_officialwallets_2 = Program.to(
            binutils.assemble(f"(q . ((51 0x{ph1.hex()} {officialwallets_amounts}) (51 0x{ph2.hex()} {officialwallets_amounts})))")
        )
        p_farmer_2 = Program.to(
            binutils.assemble(f"(q . ((51 0x{ph1.hex()} {farmer_amounts}) (51 0x{ph2.hex()} {farmer_amounts})))")
        )
        p_pool_2 = Program.to(
            binutils.assemble(f"(q . ((51 0x{ph1.hex()} {pool_amounts}) (51 0x{ph2.hex()} {pool_amounts})))")
        )

        print(f"Ph1: {ph1.hex()}")
        print(f"Ph2: {ph2.hex()}")
        print(f"Ph3: {ph3.hex()}")
        assert ph1.hex() == "8d04bcaf76369d273c4c8be9b43e394b8cf2d3d497fc9e2487c0200a298a8144"
        assert ph2.hex() == "8d04bcaf76369d273c4c8be9b43e394b8cf2d3d497fc9e2487c0200a298a8144"
        assert ph3.hex() == "8d04bcaf76369d273c4c8be9b43e394b8cf2d3d497fc9e2487c0200a298a8144"

        p_solution = Program.to(binutils.assemble("()"))

        sb_officialwallets = SpendBundle([CoinSpend(officialwallets_prefarm, p_officialwallets_2, p_solution)], G2Element())
        sb_farmer = SpendBundle([CoinSpend(farmer_prefarm, p_farmer_2, p_solution)], G2Element())
        sb_pool = SpendBundle([CoinSpend(pool_prefarm, p_pool_2, p_solution)], G2Element())

        print("\n\n\nConditions")
        print_conditions(sb_pool)
        print("\n\n\n")
        print("Farmer to spend")
        print(sb_pool)
        print(sb_farmer)
        print(sb_officialwallets)
        print("\n\n\n")
        # res = await client.push_tx(sb_farmer)
        # res = await client.push_tx(sb_pool)
        # res = await client.push_tx(sb_officialwallets)

        # print(res)
        up = await client.get_coin_records_by_puzzle_hash(farmer_prefarm.puzzle_hash, True)
        uf = await client.get_coin_records_by_puzzle_hash(pool_prefarm.puzzle_hash, True)
        uc = await client.get_coin_records_by_puzzle_hash(officialwallets_prefarm.puzzle_hash, True)
        print(up)
        print(uf)
        print(uc)
    finally:
        client.close()


asyncio.run(main())
