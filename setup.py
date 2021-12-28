from setuptools import setup

dependencies = [
    "multidict==5.1.0",  # Avoid 5.2.0 due to Avast
    "blspy==1.0.8",  # Signature library
    "chiavdf==1.0.3",  # timelord and vdf verification
    "chiabip158==1.0",  # bip158-style wallet filters
    "chiapos==1.0.6",  # proof of space
    "clvm==0.9.7",
    "clvm_rs==0.1.15",
    "clvm_tools==0.4.3",
    "aiohttp==3.7.4",  # HTTP server for full node rpc
    "aiosqlite==0.17.0",  # asyncio wrapper for sqlite, to store blocks
    "bitstring==3.1.9",  # Binary data management library
    "colorama==0.4.4",  # Colorizes terminal output
    "colorlog==5.0.1",  # Adds color to logs
    "concurrent-log-handler==0.9.19",  # Concurrently log and rotate logs
    "cryptography==3.4.7",  # Python cryptography library for TLS - keyring conflict
    "fasteners==0.16.3",  # For interprocess file locking
    "keyring==23.0.1",  # Store keys in MacOS Keychain, Windows Credential Locker
    "keyrings.cryptfile==1.3.4",  # Secure storage for keys on Linux (Will be replaced)
    #  "keyrings.cryptfile==1.3.8",  # Secure storage for keys on Linux (Will be replaced)
    #  See https://github.com/frispete/keyrings.cryptfile/issues/15
    "PyYAML==5.4.1",  # Used for config file format
    "setproctitle==1.2.2",  # Gives the stai processes readable names
    "sortedcontainers==2.4.0",  # For maintaining sorted mempools
    "websockets==8.1.0",  # For use in wallet RPC and electron UI
    "click==7.1.2",  # For the CLI
    "dnspythonchia==2.2.0",  # Query DNS seeds
    "watchdog==2.1.6",  # Filesystem event watching - watches keyring.yaml
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
    "types-setuptools",
]

kwargs = dict(
    name="stai-blockchain",
    description="Stai blockchain full node, farmer, timelord, and wallet.",
    url="https://stainetwork.org/",
    license="Apache License",
    python_requires=">=3.7, <4",
    keywords="stai blockchain node",
    install_requires=dependencies,
    setup_requires=["setuptools_scm"],
    extras_require=dict(
        uvloop=["uvloop"],
        dev=dev_dependencies,
        upnp=upnp_dependencies,
    ),
    packages=[
        "build_scripts",
        "stai",
        "stai.cmds",
        "stai.clvm",
        "stai.consensus",
        "stai.daemon",
        "stai.full_node",
        "stai.timelord",
        "stai.farmer",
        "stai.harvester",
        "stai.introducer",
        "stai.plotters",
        "stai.plotting",
        "stai.pools",
        "stai.protocols",
        "stai.rpc",
        "stai.server",
        "stai.simulator",
        "stai.types.blockchain_format",
        "stai.types",
        "stai.util",
        "stai.wallet",
        "stai.wallet.puzzles",
        "stai.wallet.rl_wallet",
        "stai.wallet.cc_wallet",
        "stai.wallet.did_wallet",
        "stai.wallet.settings",
        "stai.wallet.trading",
        "stai.wallet.util",
        "stai.ssl",
        "mozilla-ca",
    ],
    entry_points={
        "console_scripts": [
            "stai = stai.cmds.stai:main",
            "stai_wallet = stai.server.start_wallet:main",
            "stai_full_node = stai.server.start_full_node:main",
            "stai_harvester = stai.server.start_harvester:main",
            "stai_farmer = stai.server.start_farmer:main",
            "stai_introducer = stai.server.start_introducer:main",
            "stai_timelord = stai.server.start_timelord:main",
            "stai_timelord_launcher = stai.timelord.timelord_launcher:main",
            "stai_full_node_simulator = stai.simulator.start_simulator:main",
        ]
    },
    package_data={
        "stai": ["pyinstaller.spec"],
        "": ["*.clvm", "*.clvm.hex", "*.clib", "*.clinc", "*.clsp", "py.typed"],
        "stai.util": ["initial-*.yaml", "english.txt"],
        "stai.ssl": ["stai_ca.crt", "stai_ca.key", "dst_root_ca.pem"],
        "mozilla-ca": ["cacert.pem"],
    },
    use_scm_version={"fallback_version": "unknown-no-.git-directory"},
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    zip_safe=False,
)


if __name__ == "__main__":
    setup(**kwargs)  # type: ignore
