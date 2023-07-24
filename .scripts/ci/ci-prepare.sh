#!/bin/bash
set +e

if [ process.platform != "win32" ]; then
  if [ -n "$TIMEZ" ]; then
    ln -sf /usr/share/zoneinfo/${TIMEZ} /etc/localtime
    echo "$TIMEZ" > /etc/timezone
  fi
fi

# git config --system core.fileMode false
# git config --global core.fileMode false

