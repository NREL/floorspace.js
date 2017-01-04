<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <nav id="toolbar">
        <section class="tools">
            the actual tools
        </section>
        <section class="settings">

            <div class="input-select" id="scale">
                <label>zoom</label>
                <select v-model="scale">
                    <option v-for="i in 10">{{ i * 10 }}%</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14" height="10px">
                    <path d="M.5 0v14l11-7-11-7z" transform="translate(13) rotate(90)"></path>
                </svg>
            </div>

            <div class="input-select" id="drawing-mode">
                <label>mode</label>
                <select v-model="mode">
                    <option v-for="mode in modes">{{ mode }}</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14" height="10px">
                    <path d="M.5 0v14l11-7-11-7z" transform="translate(13) rotate(90)"></path>
                </svg>
            </div>

        </section>

    </nav>
</template>

<script>
export default {
    name: 'toolbar',
    data: function() {
        var data =  {
            modes: ['Space', 'Select', 'Rectangle', 'Polygon', 'Place Component', 'Apply Property', 'Scale'],
            scale: '100' + '%',
            mode: null
        };
        data.mode = data.modes[0];
        return data;
    }
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";

#toolbar {
    border-bottom: 1px solid $gray-darkest;
    section {
        align-items: center;
        display: flex;
        height: 2.5rem;
        width: 100%;
        &.tools {
            background-color: $gray-medium-dark;
        }
        &.settings {
            background-color: $gray-medium-light;
        }

        >div {
            margin: 0 1rem 0 0;
            &#scale {
                margin-left: 5rem;
            }
            &#drawing-mode {
                right: 5rem;
                position: absolute;
                > select {
                    width: 8.5rem;
                }
            }

        }

    }
}
</style>
