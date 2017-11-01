import openFloorplanSvg from './../assets/svg-icons/open_floorplan.svg';
import saveFloorplanSvg from './../assets/svg-icons/save_floorplan.svg';
import importLibrarySvg from './../assets/svg-icons/import_library.svg';

import undoSvg from './../assets/svg-icons/undo.svg';
import redoSvg from './../assets/svg-icons/redo.svg';

import floorplanTabSvg from './../assets/svg-icons/tab_floorplan.svg';
import shadingTabSvg from './../assets/svg-icons/tab_shading.svg';
import assignTabSvg from './../assets/svg-icons/tab_assign.svg';
import componentsTabSvg from './../assets/svg-icons/tab_components.svg';

import toolDrawRectangleSvg from './../assets/svg-icons/tool_draw_rectangle.svg';
import toolDrawPolygonSvg from './../assets/svg-icons/tool_draw_polygon.svg';
import toolEraseSvg from './../assets/svg-icons/tool_erase.svg';
import toolMoveSizeSvg from './../assets/svg-icons/tool_move_size.svg';
import toolColorSvg from './../assets/svg-icons/tool_color.svg';
import toolImageSvg from './../assets/svg-icons/image_icon.svg';
import toolFillSvg from './../assets/svg-icons/fill_icon.svg';
import toolPlaceComponent from './../assets/svg-icons/lego_brick_icon.svg';

import ZoomToFitSvg from './../assets/svg-icons/zoom_to_fit.svg';
import zoomInSvg from './../assets/svg-icons/zoom_in.svg';
import zoomOutSvg from './../assets/svg-icons/zoom_out.svg';
import panSvg from './../assets/svg-icons/pan.svg';
import addImage from './../assets/svg-icons/add_image.svg';

import ComponentsWindow from './../assets/svg-icons/components_window.svg';
import ComponentsDaylighting from './../assets/svg-icons/components_daylighting.svg';

const ComponentIcon = {
  name: 'ComponentIcon',
  props: ['which'],
  template: `
    <ComponentsWindow v-if="which === 'window_definitions'" class="button" />
    <ComponentsDaylighting v-else-if="which === 'daylighting_control_definitions'" class="button" />
  `,
  components: {
    ComponentsWindow,
    ComponentsDaylighting,
  },
};

import AssignBldgModule from './../assets/svg-icons/assign_bldgmodule.svg';
import AssignConstructions from './../assets/svg-icons/assign_constructions.svg';
import AssignActivity from './../assets/svg-icons/assign_activity.svg';
import AssignThermalZone from './../assets/svg-icons/assign_thermalzone.svg';
import AssignRoof from './../assets/svg-icons/assign_roof.svg';

const AssignSpacePropIcon = {
  name: 'AssignSpacePropIcon',
  props: ['which'],
  template: `
    <AssignBldgModule v-if="which === 'building_units'" class="button" />
    <AssignThermalZone v-else-if="which === 'thermal_zones'" class="button" />
    <AssignActivity v-else-if="which === 'space_types'" class="button" />
    <AssignRoof v-else-if="which === 'pitched_roofs'" class="button" />
  `,
  components: {
    AssignBldgModule,
    AssignThermalZone,
    AssignActivity,
    AssignRoof,
  },
};

import QuickstartIconNewMapFloorplan from './../assets/svg-icons/quickstart_icon_new_map_floorplan.svg';
import QuickstartIconNewFloorplan from './../assets/svg-icons/quickstart_icon_newfloorplan.svg';
import QuickstartIconOpenFloorplan from './../assets/svg-icons/quickstart_icon_openfloorplan.svg';

import InfoIcon from './../assets/svg-icons/info_icon.svg';
import SettingsGear from './../assets/svg-icons/settings_gear.svg';

export default {
  'open-floorplan-svg': openFloorplanSvg,
  'save-floorplan-svg': saveFloorplanSvg,
  'import-library-svg': importLibrarySvg,
  'undo-svg': undoSvg,
  'redo-svg': redoSvg,
  'tab-floorplan-svg': floorplanTabSvg,
  'tab-shading-svg': shadingTabSvg,
  'tab-assign-svg': assignTabSvg,
  'tab-components-svg': componentsTabSvg,

  'tool-color-svg': toolColorSvg,
  'tool-draw-rectangle-svg': toolDrawRectangleSvg,
  'tool-draw-polygon-svg': toolDrawPolygonSvg,
  'tool-erase-svg': toolEraseSvg,
  'tool-move-size-svg': toolMoveSizeSvg,
  'tool-image-svg': toolImageSvg,
  'tool-fill-svg': toolFillSvg,
  'tool-component-svg': toolPlaceComponent,

  'zoom-in-svg': zoomInSvg,
  'zoom-out-svg': zoomOutSvg,
  'pan-svg': panSvg,
  'add-image': addImage,
  ZoomToFitSvg,

  ComponentIcon,
  AssignSpacePropIcon,

  QuickstartIconNewMapFloorplan,
  QuickstartIconNewFloorplan,
  QuickstartIconOpenFloorplan,

  InfoIcon,
  SettingsGear,
};
