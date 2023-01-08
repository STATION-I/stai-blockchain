from typing import Dict

# The rest of the codebase uses mojos everywhere.
# Only use these units for user facing interfaces.
units: Dict[str, int] = {
    "stai": 10 ** 9,  # 1 stai (STAI) is 1,000,000,000 mojo (1 billion)
    "mojo": 1,
    "cat": 10 ** 3,  # 1 CAT is 1000 CAT mojos
}
