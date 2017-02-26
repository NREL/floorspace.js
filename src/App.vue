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

            <view-3d v-if="mode==='3d'"></view-3d>
            <canvas-view v-if="mode!=='3d'"></canvas-view>

            <background-modal v-if="backgroundModalVisible" @close="backgroundModalVisible = false"></background-modal>
            <assign-object-modal :type="assignObjectType" v-if="assignObjectModalVisible" @close="assignObjectModalVisible = false"></assign-object-modal>
            <create-object-modal v-if="createObjectModalVisible" @close="createObjectModalVisible = false"></create-object-modal>
            <inspector @assignObject="showModal('assign-object', $event)"></inspector>
        </main>
        <library></library>
    </div>
</template>

<script>

// this import order is important, if the grid is loaded before the other elements or after the toolbar, it ends up warped
import Navigation from './components/Navigation'
import Inspector from './components/Inspector'
import Canvas from './components/Canvas/Canvas'
import View3d from './components/3d/3d'
import Toolbar from './components/Toolbar'
import BackgroundModal from './components/BackgroundModal'
import AssignObjectModal from './components/AssignObjectModal'
import CreateObjectModal from './components/CreateObjectModal'
import Library from './components/Library'

import { mapState } from 'vuex'

export default {
    name: 'app',
    data () {
        return {
            backgroundModalVisible: false,
            createObjectModalVisible: false,
            assignObjectModalVisible: false,
            assignObjectType: null
        }
    },
    beforeCreate () {
        // create a default story, set as current story
        this.$store.dispatch('models/initStory');
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
                this.assignObjectType = eventData;
            }
        }
    },
    computed: {
        ...mapState({ mode: state => state.application.currentSelections.mode })
    },
    components: {
        'canvas-view': Canvas,
        'view-3d': View3d,
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
