require 'openstudio'
require 'json'

vt = OpenStudio::OSVersion::VersionTranslator.new
model = vt.loadModel(ARGV[0]).get

library = {}

library[:version] = "0.3.1"

application = {}
library[:application] = application

project = {}
config = {:units => 'ft', :language =>'en-us'}
ground = {:floor_offset => nil, :azimuth_angle => nil, :tilt_slope => nil}
grid = {:visible => nil, :spacing => nil}
view = {:min_x => nil, :min_y => nil, :max_x => nil, :max_y => nil}
map = {:visible => nil, :latitude => nil, :longitude => nil, :zoom => nil, :elevation => nil, :enabled => nil, :initialized => nil, :rotation => nil}
previous_story = {:visible => nil}

project[:config] = config
project[:north_axis] = 0
project[:ground] = ground
project[:grid] = grid
project[:view] = view
project[:map] = map
project[:previous_story] = previous_story
project[:show_import_export] = nil
library[:project] = project

stories = []
library[:stories] = stories

building_units = []
library[:building_units] = building_units

thermal_zones = []
library[:thermal_zones] = thermal_zones

space_types = []
i = 0
model.getSpaceTypes.each do |st|
  color = nil
  rc = st.renderingColor
  if rc.is_initialized
    red = rc.get.renderingRedValue
    green = rc.get.renderingGreenValue
    blue = rc.get.renderingBlueValue
    color = "##{sprintf("%02x", red).upcase}#{sprintf("%02x", green).upcase}#{sprintf("%02x", blue).upcase}"
  end
  space_types << {:id => "", :handle => st.handle.to_s, :name => st.nameString, :color => color}
  i+=1
end
library[:space_types] = space_types

construction_sets = []
i = 0
model.getDefaultConstructionSets.each do |cs|
  construction_sets << {:id => "", :handle => cs.handle.to_s, :name => cs.nameString}
  i+=1
end
library[:construction_sets] = construction_sets

window_definitions = []
#DLM: these distances are in feet, what happens if user changes app to m?
window_definitions << {:id => "", :name => "Window A", :window_definition_type => "Single Window", :wwr => nil, :sill_height => 3, :window_spacing => nil, :height => 4, :width => 2, :overhang_projection_factor => nil, :fin_projection_factor => nil}
window_definitions << {:id => "", :name => "Window B", :window_definition_type => "Single Window", :wwr => nil, :sill_height => 3, :window_spacing => nil, :height => 4, :width => 3, :overhang_projection_factor => nil, :fin_projection_factor => nil}
window_definitions << {:id => "", :name => "Window C", :window_definition_type => "Single Window", :wwr => nil, :sill_height => 3, :window_spacing => nil, :height => 4, :width => 4, :overhang_projection_factor => nil, :fin_projection_factor => nil}
window_definitions << {:id => "", :name => "Repeating Window A", :window_definition_type => "Repeating Windows", :wwr => nil, :sill_height => 3, :window_spacing => 6, :height => 4, :width => 2, :overhang_projection_factor => nil, :fin_projection_factor => nil}
window_definitions << {:id => "", :name => "Repeating Window B", :window_definition_type => "Repeating Windows", :wwr => nil, :sill_height => 3, :window_spacing => 6, :height => 4, :width => 3, :overhang_projection_factor => nil, :fin_projection_factor => nil}
window_definitions << {:id => "", :name => "Repeating Window C", :window_definition_type => "Repeating Windows", :wwr => nil, :sill_height => 3, :window_spacing => 6, :height => 4, :width => 4, :overhang_projection_factor => nil, :fin_projection_factor => nil}
window_definitions << {:id => "", :name => "30% WWR", :window_definition_type => "Window to Wall Ratio", :wwr => 0.3, :sill_height => 3, :window_spacing => 6, :height => nil, :width => nil, :overhang_projection_factor => nil, :fin_projection_factor => nil}
window_definitions << {:id => "", :name => "40% WWR", :window_definition_type => "Window to Wall Ratio", :wwr => 0.4, :sill_height => 3, :window_spacing => 6, :height => nil, :width => nil, :overhang_projection_factor => nil, :fin_projection_factor => nil}
library[:window_definitions] = window_definitions

daylighting_control_definitions = []
daylighting_control_definitions << {:id => "", :name => "Daylighting Control A", :illuminance_setpoint => 300, :height => 3}
daylighting_control_definitions << {:id => "", :name => "Daylighting Control B", :illuminance_setpoint => 500, :height => 3}
library[:daylighting_control_definitions] = daylighting_control_definitions

pitched_roofs = []
pitched_roofs << {:id => "", :name => "Gable Pitched Roof", :pitched_roof_type => "Gable", :pitch => 6, :shed_direction => nil, :color => "#291FA9"}
pitched_roofs << {:id => "", :name => "Hip Pitched Roof", :pitched_roof_type => "Hip", :pitch => 6, :shed_direction => nil, :color => "#E6C478"}
pitched_roofs << {:id => "", :name => "Shed Pitched Roof", :pitched_roof_type => "Shed", :pitch => 6, :shed_direction => 0, :color => "#A91F1F"}
library[:pitched_roofs] = pitched_roofs

File.open('library.json', 'w') do |file|
  file << JSON::pretty_generate(library)
end
