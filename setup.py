from setuptools import setup

dependencies = [
    "blspy==1.0.5",  # Signature library
    "chiavdf==1.0.2",  # timelord and vdf verification
    "chiabip158==1.0",  # bip158-style wallet filters
    "chiapos==1.0.4",  # proof of space
    "clvm==0.9.7",
    "clvm_rs==0.1.10",
    "clvm_tools==0.4.3",
    "aiohttp==3.7.4",  # HTTP server for full node rpc
    "aiosqlite==0.17.0",  # asyncio wrapper for sqlite, to store blocks
    "bitstring==3.1.9",  # Binary data management library
    "colorama==0.4.4",  # Colorizes terminal output
    "colorlog==5.0.1",  # Adds color to logs
    "concurrent-log-handler==0.9.19",  # Concurrently log and rotate logs
    "cryptography==36.0.1",  # Python cryptography library for TLS - keyring conflict
    "fasteners==0.16.3",  # For interprocess file locking
    "keyring==23.0.1",  # Store keys in MacOS Keychain, Windows Credential Locker
    "keyrings.cryptfile==1.3.4",  # Secure storage for keys on Linux (Will be replaced)
    #  "keyrings.cryptfile==1.3.8",  # Secure storage for keys on Linux (Will be replaced)
    #  See https://github.com/frispete/keyrings.cryptfile/issues/15
    "PyYAML==5.4.1",  # Used for config file format
    "setproctitle==1.2.2",  # Gives the chia processes readable names
    "sortedcontainers==2.3.0",  # For maintaining sorted mempools
    "websockets==8.1.0",  # For use in wallet RPC and electron UI
    "click==7.1.2",  # For the CLI
    "dnspython==2.1.0",  # Query DNS seeds
    "watchdog==2.1.3",  # Filesystem event watching - watches keyring.yaml
]

upnp_dependencies = [
    "miniupnpc==2.2.2",  # Allows users to open ports on their router
]

dev_dependencies = [
    "pytest",
    "pytest-asyncio",
    "flake8",
    "mypy",
    "black",
    "aiohttp_cors",  # For blackd
    "ipython",  # For asyncio debugging
]

kwargs = dict(
    name="staicoin-blockchain",
    author="Mariano Sorgente",
    author_email="admin@staicoin-network.net",
    description="staicoin blockchain full node, farmer, timelord, and wallet.",
    url="https://staicoin-network.net/",
    license="Apache License",
    python_requires=">=3.7, <4",
    keywords="staicoin blockchain node",
    install_requires=dependencies,
    setup_requires=["setuptools_scm"],
    extras_require=dict(
        uvloop=["uvloop"],
        dev=dev_dependencies,
        upnp=upnp_dependencies,
    ),
    packages=[
        "build_scripts",
        "staicoin",
        "staicoin.cmds",
        "staicoin.clvm",
        "staicoin.consensus",
        "staicoin.daemon",
        "staicoin.full_node",
        "staicoin.timelord",
        "staicoin.farmer",
        "staicoin.harvester",
        "staicoin.introducer",
        "staicoin.plotting",
        "staicoin.pools",
        "staicoin.protocols",
        "staicoin.rpc",
        "staicoin.server",
        "staicoin.simulator",
        "staicoin.types.blockchain_format",
        "staicoin.types",
        "staicoin.util",
        "staicoin.wallet",
        "staicoin.wallet.puzzles",
        "staicoin.wallet.rl_wallet",
        "staicoin.wallet.cc_wallet",
        "staicoin.wallet.did_wallet",
        "staicoin.wallet.settings",
        "staicoin.wallet.trading",
        "staicoin.wallet.util",
        "staicoin.ssl",
        "mozilla-ca",
    ],
    entry_points={
        "console_scripts": [
            "staicoin = staicoin.cmds.staicoin:main",
            "staicoin_wallet = staicoin.server.start_wallet:main",
            "staicoin_full_node = staicoin.server.start_full_node:main",
            "staicoin_harvester = staicoin.server.start_harvester:main",
            "staicoin_farmer = staicoin.server.start_farmer:main",
            "staicoin_introducer = staicoin.server.start_introducer:main",
            "staicoin_timelord = staicoin.server.start_timelord:main",
            "staicoin_timelord_launcher = staicoin.timelord.timelord_launcher:main",
            "staicoin_full_node_simulator = staicoin.simulator.start_simulator:main",
        ]
    },
    package_data={
        "staicoin": ["pyinstaller.spec"],
        "": ["*.clvm", "*.clvm.hex", "*.clib", "*.clinc", "*.clsp"],
        "staicoin.util": ["initial-*.yaml", "english.txt"],
        "staicoin.ssl": ["staicoin_ca.crt", "staicoin_ca.key", "dst_root_ca.pem"],
        "mozilla-ca": ["cacert.pem"],
    },
    use_scm_version={"fallback_version": "unknown-no-.git-directory"},
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    zip_safe=False,
)


if __name__ == "__main__":
    setup(**kwargs)
