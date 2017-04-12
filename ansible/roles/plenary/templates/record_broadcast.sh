#!/bin/bash

on_die () {
  # Kill all children
  pkill -KILL -P $$
}

trap 'on_die' TERM

SRC="$1"
NAME="$2"
DEST="{{plenary_streams_dir}}/${NAME}/unhangout-$(date +%Y-%m-%dT%H:%M:%S).flv"
mkdir -p `dirname "$DEST"` 
/usr/bin/avconv -i "$SRC" -c copy -f flv "$DEST"

wait
