#!/bin/bash

mv /boost /src/dependencies
source /emsdk/emsdk_env.sh
mkdir -p /src/embuild
cd /src/embuild
emcmake cmake ..
emmake make
emcc --bind -O0 -s WASM=1 -s NO_EXIT_RUNTIME=1 -s ALLOW_MEMORY_GROWTH=1 -s DEMANGLE_SUPPORT=1 -s EXPORT_ALL=1 -s EXPORTED_RUNTIME_METHODS=['addOnPostRun'] -Wl,--whole-archive libtest_lib.a -Wl,-no-whole-archive -o libtest_lib.js
