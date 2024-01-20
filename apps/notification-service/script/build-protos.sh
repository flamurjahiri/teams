#!/bin/bash

BASEDIR=$(dirname "$0")
cd "${BASEDIR}"/../ || exit

PROTO_DEST=./src/app/generated-protos

mkdir -p ${PROTO_DEST}


npm install -g protoc-gen-ts
protoc -I=./src/app/protos --ts_out=${PROTO_DEST} ./src/app/protos/*.proto
