import time
from dataclasses import dataclass
from secrets import token_bytes
from typing import Optional

from stai.harvester.harvester_api import Harvester
from stai.plot_sync.sender import Sender
from stai.protocols.harvester_protocol import PlotSyncIdentifier
from stai.server.start_service import Service
from stai.server.ws_connection import Message, NodeType
from stai.types.blockchain_format.sized_bytes import bytes32
from stai.util.ints import uint64
from tests.time_out_assert import time_out_assert


@dataclass
class WSStaiConnectionDummy:
    connection_type: NodeType
    peer_node_id: bytes32
    peer_host: str = "localhost"
    peer_port: int = 0
    last_sent_message: Optional[Message] = None

    async def send_message(self, message: Message) -> None:
        self.last_sent_message = message


def get_dummy_connection(node_type: NodeType, peer_id: Optional[bytes32] = None) -> WSStaiConnectionDummy:
    return WSStaiConnectionDummy(node_type, bytes32(token_bytes(32)) if peer_id is None else peer_id)


def plot_sync_identifier(current_sync_id: uint64, message_id: uint64) -> PlotSyncIdentifier:
    return PlotSyncIdentifier(uint64(int(time.time())), current_sync_id, message_id)


async def start_harvester_service(harvester_service: Service) -> Harvester:
    # Set the `last_refresh_time` of the plot manager to avoid initial plot loading
    harvester: Harvester = harvester_service._node
    harvester.plot_manager.last_refresh_time = time.time()
    await harvester_service.start()
    harvester.plot_manager.stop_refreshing()  # type: ignore[no-untyped-call]  # TODO, Add typing in PlotManager

    assert harvester.plot_sync_sender._sync_id == 0
    assert harvester.plot_sync_sender._next_message_id == 0
    assert harvester.plot_sync_sender._last_sync_id == 0
    assert harvester.plot_sync_sender._messages == []

    def wait_for_farmer_connection(plot_sync_sender: Sender) -> bool:
        return plot_sync_sender._connection is not None

    await time_out_assert(10, wait_for_farmer_connection, True, harvester.plot_sync_sender)

    return harvester
