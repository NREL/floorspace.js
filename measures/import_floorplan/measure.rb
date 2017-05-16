# see the URL below for information on how to write OpenStudio measures
# http://nrel.github.io/OpenStudio-user-documentation/reference/measure_writing_guide/

# start the measure
class ImportFloorplan < OpenStudio::Ruleset::ModelUserScript

  # human readable name
  def name
    return "Import Floorplan"
  end

  # human readable description
  def description
    return "Imports a floorplan JSON file written by the OpenStudio Geometry Editor."
  end

  # human readable description of modeling approach
  def modeler_description
    return "Currently this measure deletes the existing geometry and replaces it.  In the future, a more advanced merge technique will be employed."
  end

  # define the arguments that the user will input
  def arguments(model)
    args = OpenStudio::Ruleset::OSArgumentVector.new

    # path to the floorplan JSON file to load
    floorplan_path = OpenStudio::Ruleset::OSArgument.makeStringArgument("floorplan_path", true)
    floorplan_path.setDisplayName("Floorplan Path")
    floorplan_path.setDescription("Path to the floorplan JSON.")
    args << floorplan_path

    return args
  end

  # define what happens when the measure is run
  def run(model, runner, user_arguments)
    super(model, runner, user_arguments)

    # use the built-in error checking
    if !runner.validateUserArguments(arguments(model), user_arguments)
      return false
    end

    # assign the user inputs to variables
    floorplan_path = runner.getStringArgumentValue("floorplan_path", user_arguments)

    # check the floorplan_path for reasonableness
    if floorplan_path.empty?
      runner.registerError("Empty floorplan path was entered.")
      return false
    end
    
    path = runner.workflow.findFile(floorplan_path)
    if path.empty?
      runner.registerError("Cannot find floorplan path '#{floorplan_path}'.")
      return false
    end
    
    json = nil
    File.open(path.get.to_s, 'r') do |file|
      json = file.read
    end

    floorplan = OpenStudio::FloorplanJS::load(json)
    if floorplan.empty?
      runner.registerError("Cannot load floorplan from '#{floorplan_path}'.")
      return false
    end

    scene = floorplan.get.toThreeScene(true)
    new_model = OpenStudio::Model::modelFromThreeJS(scene)
    
    if new_model.empty?
      runner.registerError("Cannot convert floorplan to model.")
      return false
    end
    
    # mega lame merge
    model.getPlanarSurfaceGroups {|g| g.remove}
    new_model.get.getPlanarSurfaceGroups {|g| g.clone(model)}

    return true

  end
  
end

# register the measure to be used by the application
ImportFloorplan.new.registerWithApplication
