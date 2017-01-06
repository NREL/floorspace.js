// OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
// (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
// (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
// (3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
// (4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

export default {
    // models
    'stories': [/*{
        'id': null,
        'handle': null,
        'name': null,
        'below_floor_plenum_height': 0,
        'floor_to_ceiling_height': 0,
        'multiplier': 0,
        'images': [], // image ids
        'geometry_id': null, // geometry id
        'spaces': [], // space ids
        'windows': [{
            'window': null,
            'vertex': null
        }]
    }*/],
    'spaces': [{
        'id': null,
        'handle': null,
        'name': null,
        'face': null, // face id
        'building_unit': null, // building_unit id
        'thermal_zone': null, // thermal_zone id
        'space_type': null, // space_type id
        'construction_set': null, // construction_set id
        'daylighting_controls': [{
            'daylighting_control': null,
            'vertex': null
        }]
    }],

    // lib
    'building_units': [{
        'id': null,
        'handle': null,
        'name': null
    }],
    'thermal_zones': [{
        'id': null,
        'handle': null,
        'name': null
    }],
    'space_types': [{
        'id': null,
        'handle': null,
        'name': null
    }],
    'construction_sets': [{
        'id': null,
        'handle': null,
        'name': null
    }],
    'constructions': [{
        'id': null,
        'handle': null,
        'name': null
    }],
    'windows': [{
        'id': null,
        'handle': null,
        'name': null
    }],
    'daylighting_controls': [{
        'id': null,
        'handle': null,
        'name': null
    }]
};
