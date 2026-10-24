"""Utility functions for server dataset resolution and file operations."""

from pathlib import Path


def find_dataset_file(filename: str) -> Path:
    """Resolve dataset files across data/sintef/ and project root."""
    candidates = [
        Path("data/sintef") / filename,
        Path("/home/abdssamie/Projects/lfp-platform/data/sintef") / filename,
        Path(filename),
        Path("/home/abdssamie/Projects/lfp-platform") / filename,
    ]
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]
