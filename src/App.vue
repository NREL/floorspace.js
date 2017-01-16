<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->
<template>
    <div id="app">
        <toolbar></toolbar>
        <main>
            <navigation></navigation>
            <canvas-view></canvas-view>
            <inspector></inspector>
        </main>
    </div>
</template>

<script>
import factory from './store/factory/index.js'

// this import order is important, if the grid is loaded before the other elements or after the toolbar, it ends up warped
import Navigation from './components/Navigation'
import Inspector from './components/Inspector'
import Canvas from './components/Canvas/Canvas'
import Toolbar from './components/Toolbar'

export default {
    name: 'app',
    components: {
        'canvas-view': Canvas,
        'navigation': Navigation,
        'toolbar': Toolbar,
        'inspector': Inspector
    },
    beforeCreate () {
        // create a default story, set as current story
        this.$store.dispatch('models/initStory');
        this.$store.dispatch('application/setCurrentStory', {
            'story': this.$store.state.models.stories[0]
        });
        // create associated geometry
        this.$store.dispatch('geometry/initGeometry', {
            'story_id': this.$store.state.application.currentSelections.story_id
        });

        // create a space, set as current space
        this.$store.dispatch('models/initSpace', {
            'story_id': this.$store.state.application.currentSelections.story_id
        });
        this.$store.dispatch('application/setCurrentSpace', {
            'space': this.$store.state.application.currentSelections.story.spaces[0]
        });
    }
}
</script>

<style src="./scss/main.scss" lang="scss"></style>
<style lang="scss" scoped>
@import "./scss/config";

</style>
