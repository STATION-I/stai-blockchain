from typing import KeysView, Generator

SERVICES_FOR_GROUP = {
    "all": "staicoin_harvester staicoin_timelord_launcher staicoin_timelord staicoin_farmer staicoin_full_node staicoin_wallet".split(),
    "node": "staicoin_full_node".split(),
    "harvester": "staicoin_harvester".split(),
    "farmer": "staicoin_harvester staicoin_farmer staicoin_full_node staicoin_wallet".split(),
    "farmer-no-wallet": "staicoin_harvester staicoin_farmer staicoin_full_node".split(),
    "farmer-only": "staicoin_farmer".split(),
    "timelord": "staicoin_timelord_launcher staicoin_timelord staicoin_full_node".split(),
    "timelord-only": "staicoin_timelord".split(),
    "timelord-launcher-only": "staicoin_timelord_launcher".split(),
    "wallet": "staicoin_wallet staicoin_full_node".split(),
    "wallet-only": "staicoin_wallet".split(),
    "introducer": "staicoin_introducer".split(),
    "simulator": "staicoin_full_node_simulator".split(),
}


def all_groups() -> KeysView[str]:
    return SERVICES_FOR_GROUP.keys()


def services_for_groups(groups) -> Generator[str, None, None]:
    for group in groups:
        for service in SERVICES_FOR_GROUP[group]:
            yield service


def validate_service(service: str) -> bool:
    return any(service in _ for _ in SERVICES_FOR_GROUP.values())
