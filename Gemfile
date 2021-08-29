source 'http://rubygems.org'

# Specify your gem's dependencies in openstudio-model-articulation.gemspec

# library gems
# only uncomment these if need newer version that included in OpenStudio Installer
# additional code in CLI call will have to make use of thse, just installing them here will not do anything
#gem 'openstudio-extension', github: 'NREL/OpenStudio-extension-gem', branch: 'develop'
#gem 'openstudio-standards', github: 'NREL/openstudio-standards', branch: 'develop'

# measure gems
# 0.4.0 release of common-measures has invalid measure.xml on view_model that prevents osws from running. Switched to develop to access fixed measure. Once 0.4.1 is released use that instead of develop.
gem 'openstudio-model-articulation', '~> 0.4', '>= 0.4.0'
#gem 'openstudio-common-measures', '~> 0.4', '>= 0.4.0'
gem 'openstudio-ee', '~> 0.4', '>= 0.4.0'
gem 'openstudio-calibration', '~> 0.4', '>= 0.4.0'

# for development testing can use specific branch of measure gems instead of release
#gem 'openstudio-model-articulation', github: 'NREL/openstudio-model-articulation-gem', branch: 'new_measures_oct2020_310'
gem 'openstudio-common-measures', github: 'NREL/openstudio-common-measures-gem', branch: 'develop'
#gem 'openstudio-ee', github: 'NREL/openstudio-ee-gem', branch: 'develop'
#gem 'openstudio-calibration', github: 'NREL/openstudio-calibration-gem', branch: 'develop'

# todo - the urban geometry measure is failing, maybe need different branch or gem relese to use with OpenStudio 3.0.1
#gem 'urbanopt-geojson', github: 'URBANopt/urbanopt-geojson-gem', branch: 'develop'

# other gems
gem 'parallel', '~> 1.19', '>= 1.19.2'
