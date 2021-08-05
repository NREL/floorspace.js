#!/bin/bash

basedir=$(dirname $0)

(
    cd $basedir
    docker build . -t emscripten-test:local
    docker run -it --rm -v "$(pwd):/src" emscripten-test:local

    cp embuild/libtest_lib.js build
    cp embuild/libtest_lib.wasm build
)
