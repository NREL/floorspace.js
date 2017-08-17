require 'openstudio'
require 'json'

vt = OpenStudio::OSVersion::VersionTranslator.new
model = vt.loadModel(ARGV[0]).get

library = {}

project = {}
config = {:units => 'ft', :language =>'en-us'} 
project[:config] = config
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

windows = []
#DLM: these distances are in feet, what happens if user changes app to m?
windows << {:id => "", :name => "Window A", :height => 4, :width => 2, :sill_height => 3}
windows << {:id => "", :name => "Window B", :height => 4, :width => 3, :sill_height => 3}
windows << {:id => "", :name => "Window C", :height => 4, :width => 4, :sill_height => 3}
windows << {:id => "", :name => "Window D", :height => 3, :width => 2, :sill_height => 3}
windows << {:id => "", :name => "Window E", :height => 3, :width => 3, :sill_height => 3}
windows << {:id => "", :name => "Window F", :height => 3, :width => 4, :sill_height => 3}
library[:windows] = windows

daylighting_controls = []
daylighting_controls << {:id => "", :name => "Daylighting Control A", :illuminance_setpoint => 300, :height => 3}
daylighting_controls << {:id => "", :name => "Daylighting Control B", :illuminance_setpoint => 500, :height => 3}
library[:daylighting_controls] = daylighting_controls

File.open('library.json', 'w') do |file|
  file << JSON::pretty_generate(library)
end