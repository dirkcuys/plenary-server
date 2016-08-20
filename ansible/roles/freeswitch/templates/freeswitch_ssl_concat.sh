#!/bin/bash

# Concatenate letsencrypt SSL certificate and private key into a form that
# freeswitch can use. Adapted from https://freeswitch.org/confluence/display/FREESWITCH/Debian+8+Jessie#Debian8Jessie-Scriptinstallfreeswitchdemowithverto_communicator

set -e

NEW_CONTENT=`cat "{{letsencrypt_signed_cert}}" "{{letsencrypt_private_key}}"`

REBUILD=""

if [ -e "{{freeswitch_tls_path}}" ]; then
  OLD_CONTENT=`cat "{{freeswitch_tls_path}}"`
  if [ "$OLD_CONTENT" != "$NEW_CONTENT" ]; then
    chmod 600 "{{freeswitch_tls_path}}"
    REBUILD="1"
  fi
else
  REBUILD="1"
fi

if [ "$REBUILD" == "1" ]; then
  echo "$NEW_CONTENT" > "{{freeswitch_tls_path}}"
  chown freeswitch.freeswitch "{{freeswitch_tls_path}}"
  chmod 400 "{{freeswitch_tls_path}}"
  service freeswitch restart
  echo "changed"
else
  echo "no change"
fi
