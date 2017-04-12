<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->
<template>
    <div id="app">
        <toolbar @setBackground="showModal('background')" @createObject="showModal('create-object')"></toolbar>
        <main>
            <navigation></navigation>

            <canvas-view></canvas-view>
            <inspector @assignObject="showModal('assign-object', $event)"></inspector>

            <background-modal v-if="backgroundModalVisible" @close="backgroundModalVisible = false"></background-modal>
            <assign-object-modal :type="assignObjectType" :target="assignObjectTarget" v-if="assignObjectModalVisible" @close="assignObjectModalVisible = false"></assign-object-modal>
            <create-object-modal v-if="createObjectModalVisible" @close="createObjectModalVisible = false"></create-object-modal>

        </main>
        <library></library>
    </div>
</template>

<script>

// this import order is important, if the grid is loaded before the other elements or after the toolbar, it ends up warped
import Navigation from './components/Navigation'
import Inspector from './components/Inspector'
import Canvas from './components/Canvas/Canvas'
import Toolbar from './components/Toolbar'
import Library from './components/Library'
import BackgroundModal from './components/Modals/BackgroundModal'
import AssignObjectModal from './components/Modals/AssignObjectModal'
import CreateObjectModal from './components/Modals/CreateObjectModal'

import { mapState } from 'vuex'

export default {
    name: 'app',
    data () {
        return {
            backgroundModalVisible: false,
            createObjectModalVisible: false,
            assignObjectModalVisible: false,
            assignObjectType: null,
            assignObjectTarget: null
        }
    },
    beforeCreate () {
        // create a default story, set as current story
        this.$store.dispatch('models/initStory');
        this.$store.dispatch('models/initSpace', {
            story: this.$store.state.application.currentSelections.story
        });
        this.$store.dispatch('application/setCurrentSpace', {
            space:  this.$store.state.application.currentSelections.story.spaces[0]
        });
    },
    methods: {
        showModal (type, eventData) {
            if (type === 'background') {
                this.backgroundModalVisible = true;
                this.createObjectModalVisible = false;
                this.assignObjectModalVisible = false;
            } else if (type === 'create-object') {
                this.backgroundModalVisible = false;
                this.createObjectModalVisible = true;
                this.assignObjectModalVisible = false;
            } else if (type === 'assign-object') {
                this.backgroundModalVisible = false;
                this.createObjectModalVisible = false;
                this.assignObjectModalVisible = true;
                this.assignObjectType = eventData.type;
                this.assignObjectTarget = eventData.target;
            }
        }
    },
    computed: {
        ...mapState({ tool: state => state.application.currentSelections.tool })
    },
    components: {
        'canvas-view': Canvas,
        'library': Library,
        'navigation': Navigation,
        'toolbar': Toolbar,
        'inspector': Inspector,
        'background-modal': BackgroundModal,
        'assign-object-modal': AssignObjectModal,
        'create-object-modal': CreateObjectModal
    }
}
</script>

<style src="./scss/main.scss" lang="scss"></style>
<style lang="scss" scoped>
@import "./scss/config";

</style>
