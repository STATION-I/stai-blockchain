from typing import KeysView, Generator

SERVICES_FOR_GROUP = {
    "all": "stai_harvester stai_timelord_launcher stai_timelord stai_farmer stai_full_node stai_wallet".split(),
    "node": "stai_full_node".split(),
    "harvester": "stai_harvester".split(),
    "farmer": "stai_harvester stai_farmer stai_full_node stai_wallet".split(),
    "farmer-no-wallet": "stai_harvester stai_farmer stai_full_node".split(),
    "farmer-only": "stai_farmer".split(),
    "timelord": "stai_timelord_launcher stai_timelord stai_full_node".split(),
    "timelord-only": "stai_timelord".split(),
    "timelord-launcher-only": "stai_timelord_launcher".split(),
    "wallet": "stai_wallet stai_full_node".split(),
    "wallet-only": "stai_wallet".split(),
    "introducer": "stai_introducer".split(),
    "simulator": "stai_full_node_simulator".split(),
}


def all_groups() -> KeysView[str]:
    return SERVICES_FOR_GROUP.keys()


def services_for_groups(groups) -> Generator[str, None, None]:
    for group in groups:
        for service in SERVICES_FOR_GROUP[group]:
            yield service


def validate_service(service: str) -> bool:
    return any(service in _ for _ in SERVICES_FOR_GROUP.values())
