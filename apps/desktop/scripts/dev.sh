#!/bin/bash
# On Linux dev containers there is no D-Bus session bus. Start a temporary
# one and silence its output so contributors don't see daemon noise in the
# terminal. On macOS/Windows dbus-daemon is absent and D-Bus issues don't
# arise, so the script falls through to electron-forge start unchanged.
if command -v dbus-daemon >/dev/null 2>&1; then
  export DBUS_SESSION_BUS_ADDRESS="unix:path=/tmp/dbus-codelane-$$"
  dbus-daemon --session --address="$DBUS_SESSION_BUS_ADDRESS" --fork 2>/dev/null
fi
exec electron-forge start
