// OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
// (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
// (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
// (3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
// (4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the 'OpenStudio' trademark, 'OS', 'os', or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

export default {
    // CONFIG
    // state.config.units
    setConfigUnits: function(state, payload) {
        if (payload.units === 'm' || payload.units === 'ft') {
            state.config.units = payload.units;
        }
    },
    // state.config.language
    setConfigLanguage: function(state, payload) {
        if (payload.language === 'EN-US') {
            state.config.language = payload.language;
        }
    },
    // state.config.north_axis
    setConfigNorthAxis: function(state, payload) {
        state.config.north_axis = parseInt(payload.north_axis) ? payload.north_axis : state.config.north_axis;
    },

    // GRID
    // state.grid.visible
    setGridVisible: function(state, payload) {
        state.grid.visible = !!payload.visible;
    },

    // state.grid.x_spacing
    setGridXSpacing: function(state, payload) {
        state.grid.x_spacing = parseInt(payload.x_spacing) ? payload.x_spacing : state.grid.x_spacing;
    },
    // state.grid.y_spacing
    setGridYSpacing: function(state, payload) {
        state.grid.y_spacing = parseInt(payload.y_spacing) ? payload.y_spacing : state.grid.y_spacing;
    },

    // VIEW
    // state.view.min_x
    setViewMinX: function(state, payload) {
        state.view.min_x = payload.min_x < state.view.max_x ? payload.min_x : state.view.min_x;
    },
    // state.view.min_y
    setViewMinY: function(state, payload) {
        state.view.min_y = payload.min_y < state.view.max_y ? payload.min_y : state.view.min_y;
    },
    // state.view.max_x
    setViewMaxX: function(state, payload) {
        state.view.max_x = payload.max_x > state.view.min_x ? payload.max_x : state.view.max_x;
    },
    // state.view.max_y
    setViewMaxY: function(state, payload) {
        state.view.max_y = payload.max_y > state.view.min_y ? payload.max_y : state.view.max_y;
    }

    // TODO: MAP
};
