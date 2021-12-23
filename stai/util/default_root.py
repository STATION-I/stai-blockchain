import os
from pathlib import Path

DEFAULT_ROOT_PATH = Path(os.path.expanduser(os.getenv("STAI_ROOT", "~/.stai/mainnet"))).resolve()

DEFAULT_KEYS_ROOT_PATH = Path(os.path.expanduser(os.getenv("STAI_KEYS_ROOT", "~/.stai_keys"))).resolve()
