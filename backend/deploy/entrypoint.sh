#!/bin/sh
set -eu
# Hubfly mounts may initially be owned by root; the API runs as the node user.
mkdir -p /app/uploads
chown -R node:node /app/uploads
exec gosu node "$@"
