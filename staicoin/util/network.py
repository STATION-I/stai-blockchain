from ipaddress import ip_address, IPv4Network, IPv6Network
from typing import Iterable, Union, Any
from staicoin.server.outbound_message import NodeType


def is_in_network(peer_host: str, networks: Iterable[Union[IPv4Network, IPv6Network]]) -> bool:
    try:
        peer_host_ip = ip_address(peer_host)
        return any(peer_host_ip in network for network in networks)
    except ValueError:
        return False


def is_localhost(peer_host: str) -> bool:
    return peer_host == "127.0.0.1" or peer_host == "localhost" or peer_host == "::1" or peer_host == "0:0:0:0:0:0:0:1"


def class_for_type(type: NodeType) -> Any:
    if type is NodeType.FULL_NODE:
        from staicoin.full_node.full_node_api import FullNodeAPI

        return FullNodeAPI
    elif type is NodeType.WALLET:
        from staicoin.wallet.wallet_node_api import WalletNodeAPI

        return WalletNodeAPI
    elif type is NodeType.INTRODUCER:
        from staicoin.introducer.introducer_api import IntroducerAPI

        return IntroducerAPI
    elif type is NodeType.TIMELORD:
        from staicoin.timelord.timelord_api import TimelordAPI

        return TimelordAPI
    elif type is NodeType.FARMER:
        from staicoin.farmer.farmer_api import FarmerAPI

        return FarmerAPI
    elif type is NodeType.HARVESTER:
        from staicoin.harvester.harvester_api import HarvesterAPI

        return HarvesterAPI
    raise ValueError("No class for type")
