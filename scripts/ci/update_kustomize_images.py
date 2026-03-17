from __future__ import annotations

import sys
from pathlib import Path


SERVICES = [
    ("collector-api-gateway", "collector-api-gateway"),
    ("collector-auth-service", "collector-auth-service"),
    ("collector-catalog-service", "collector-catalog-service"),
    ("collector-article-service", "collector-article-service"),
    ("collector-audit-service", "collector-audit-service"),
    ("collector-notification-service", "collector-notification-service"),
    ("collector-frontend", "collector-frontend"),
]


def main() -> int:
    if len(sys.argv) != 5:
        raise SystemExit(
            "usage: update_kustomize_images.py <overlay-file> <ghcr-owner> <tag> <latest-tag>"
        )

    overlay_file = Path(sys.argv[1])
    ghcr_owner = sys.argv[2]
    tag = sys.argv[3]
    latest_tag = sys.argv[4]

    text = overlay_file.read_text()

    for _, image_name in SERVICES:
        text = replace_tag(
            text,
            f"newName: ghcr.io/{ghcr_owner}/{image_name}",
            tag,
            latest_tag,
        )

    overlay_file.write_text(text)
    return 0


def replace_tag(text: str, marker: str, tag: str, latest_tag: str) -> str:
    marker_index = text.find(marker)
    if marker_index == -1:
        raise ValueError(f"missing image marker: {marker}")

    line_start = text.find("\n", marker_index)
    if line_start == -1:
        raise ValueError(f"missing tag line after marker: {marker}")

    tag_start = line_start + 1
    tag_end = text.find("\n", tag_start)
    if tag_end == -1:
        tag_end = len(text)

    current_line = text[tag_start:tag_end]
    expected_prefix = "    newTag: "
    if not current_line.startswith(expected_prefix):
        raise ValueError(f"unexpected tag line after marker {marker}: {current_line}")

    current_tag = current_line[len(expected_prefix) :]
    if current_tag != latest_tag and current_tag != tag:
        # Preserve manual deviations by requiring the file to stay in the expected format.
        raise ValueError(
            f"unexpected current tag for {marker}: {current_tag} (expected {latest_tag} or {tag})"
        )

    return f"{text[:tag_start]}{expected_prefix}{tag}{text[tag_end:]}"


if __name__ == "__main__":
    raise SystemExit(main())
