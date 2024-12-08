from typing import Optional
from hashlib import md5


def seed_to_short(seed: Optional[str]) -> Optional[int]:
    return seed and (int.from_bytes(md5(str(seed).encode()).digest()) % 2**16)
