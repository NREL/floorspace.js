export const state = {
    "stories": [
        {
            "id": "1",
            "name": "Foundation",
            "handle": null,
            "below_floor_plenum_height": 0,
            "floor_to_ceiling_height": 0,
            "multiplier": 0,
            "spaces": [
                {
                    "id": "3",
                    "name": "Basement F",
                    "color": "#007373",
                    "handle": null,
                    "face_id": null,
                    "daylighting_controls": [],
                    "building_unit_id": 500,
                    "building_type_id": null,
                    "thermal_zone_id": null,
                    "space_type_id": "18",
                    "construction_set_id": null
                },
                {
                    "id": "4",
                    "name": "Crawlspace F",
                    "color": "#000000",
                    "handle": null,
                    "face_id": null,
                    "daylighting_controls": [],
                    "building_unit_id": 500,
                    "building_type_id": null,
                    "thermal_zone_id": null,
                    "space_type_id": "19",
                    "construction_set_id": null
                }
            ],
            "windows": [],
            "shading": [],
            "images": [],
            "geometry_id": "2"
        },
        {
            "id": "5",
            "name": "Story 1",
            "handle": null,
            "below_floor_plenum_height": 0,
            "floor_to_ceiling_height": 0,
            "multiplier": 0,
            "spaces": [
                {
                    "id": "7",
                    "name": "Living 1",
                    "color": "#004749",
                    "handle": null,
                    "face_id": null,
                    "daylighting_controls": [],
                    "building_unit_id": 500,
                    "building_type_id": null,
                    "thermal_zone_id": null,
                    "space_type_id": "17",
                    "construction_set_id": null
                },
                {
                    "id": "14",
                    "name": "Garage 1",
                    "color": "#b9ff14",
                    "handle": null,
                    "face_id": null,
                    "daylighting_controls": [],
                    "building_unit_id": null,
                    "building_type_id": null,
                    "thermal_zone_id": null,
                    "space_type_id": "20",
                    "construction_set_id": null
                }
            ],
            "windows": [],
            "shading": [],
            "images": [],
            "geometry_id": "6"
        },
        {
            "id": "8",
            "name": "Story 2",
            "handle": null,
            "below_floor_plenum_height": 0,
            "floor_to_ceiling_height": 0,
            "multiplier": 0,
            "spaces": [
                {
                    "id": "10",
                    "name": "Living 2",
                    "color": "#009196",
                    "handle": null,
                    "face_id": null,
                    "daylighting_controls": [],
                    "building_unit_id": null,
                    "building_type_id": "old_building_type",
                    "thermal_zone_id": null,
                    "space_type_id": "17",
                    "construction_set_id": null
                },
                {
                    "id": "15",
                    "name": "Attic 2",
                    "color": "#001516",
                    "handle": null,
                    "face_id": null,
                    "daylighting_controls": [],
                    "building_unit_id": null,
                    "building_type_id": "old_building_type",
                    "thermal_zone_id": null,
                    "space_type_id": "21",
                    "construction_set_id": null
                }
            ],
            "windows": [],
            "shading": [],
            "images": [],
            "geometry_id": "9"
        },
        {
            "id": "11",
            "name": "Story 3",
            "handle": null,
            "below_floor_plenum_height": 0,
            "floor_to_ceiling_height": 0,
            "multiplier": 0,
            "spaces": [
                {
                    "id": "13",
                    "name": "Living 3",
                    "color": "#8BC600",
                    "handle": null,
                    "face_id": null,
                    "daylighting_controls": [],
                    "building_unit_id": null,
                    "building_type_id": null,
                    "thermal_zone_id": null,
                    "space_type_id": "17",
                    "construction_set_id": null
                },
                {
                    "id": "16",
                    "name": "Attic 3",
                    "color": "#557a00",
                    "handle": null,
                    "face_id": null,
                    "daylighting_controls": [],
                    "building_unit_id": null,
                    "building_type_id": null,
                    "thermal_zone_id": null,
                    "space_type_id": "21",
                    "construction_set_id": null
                }
            ],
            "windows": [],
            "shading": [],
            "images": [],
            "geometry_id": "12"
        }
    ],
    "library": {
        "building_units": [
            {
                "id": "500",
                "color": "#007373",
                "name": "Building Unit 1"
            }
        ],
        "building_types": [
            {
                "id": "old_building_type",
                "color": "#123456",
                "name": "Old Building Type"
            }, {
                "id": "new_building_type",
                "color": "#654321",
                "name": "New Building Type"
            }
        ],
        "thermal_zones": [
            {
                "id": "22",
                "color": "#007373",
                "name": "Thermal Zone 1"
            },
            {
                "id": "23",
                "color": "#000000",
                "name": "Thermal Zone 2"
            }
        ],
        "space_types": [
            {
                "id": "17",
                "color": "#007373",
                "name": "Living",
                "type": "space_types"
            },
            {
                "id": "18",
                "color": "#000000",
                "name": "Basement",
                "type": "space_types"
            },
            {
                "id": "19",
                "color": "#004749",
                "name": "Crawlspace",
                "type": "space_types"
            },
            {
                "id": "20",
                "color": "#009196",
                "name": "Garage",
                "type": "space_types"
            },
            {
                "id": "21",
                "color": "#8BC600",
                "name": "Attic",
                "type": "space_types"
            }
        ],
        "construction_sets": [],
        "windows": [],
        "daylighting_controls": []
    }
};
