cmake_minimum_required(VERSION 3.8)
project(EmscriptenTest)
set (CMAKE_CXX_STANDARD 11)

#if (MSVC_VERSION GREATER_EQUAL "1900")
#    include(CheckCXXCompilerFlag)
#    CHECK_CXX_COMPILER_FLAG("/std:c++latest" _cpp_latest_flag_supported)
#    if (_cpp_latest_flag_supported)
#        add_compile_options("/std:c++latest")
#    endif()
#endif()

# require these run time checks
add_definitions(-DBOOST_UBLAS_CHECK_ENABLE)
add_definitions(-DBOOST_UBLAS_TYPE_CHECK)
add_definitions(-DBOOST_UBLAS_NO_STD_CERR)

if(MSVC)
  add_definitions(/MP)
endif(MSVC)

include_directories(dependencies)

set(test_lib_src
  dependencies/jsoncpp/jsoncpp.cpp
  dependencies/polypartition/polypartition.cpp
  src/utilities/core/Assert.hpp
  src/utilities/core/Compare.hpp
  src/utilities/core/Compare.cpp
  src/utilities/core/Json.hpp
  src/utilities/core/Json.cpp
  src/utilities/core/Logger.hpp
  src/utilities/core/StaticInitializer.hpp
  src/utilities/core/UUID.hpp
  src/utilities/core/UUID.cpp
  src/utilities/data/Matrix.hpp
  src/utilities/data/Matrix.cpp
  src/utilities/data/Vector.hpp
  src/utilities/data/Vector.cpp
  src/utilities/math/FloatCompare.hpp
  src/utilities/geometry/BoundingBox.hpp
  src/utilities/geometry/BoundingBox.cpp
  src/utilities/geometry/Emscripten.cpp
  src/utilities/geometry/EulerAngles.hpp
  src/utilities/geometry/EulerAngles.cpp
  src/utilities/geometry/FloorplanJS.hpp
  src/utilities/geometry/FloorplanJS.cpp
  src/utilities/geometry/Geometry.hpp
  src/utilities/geometry/Geometry.cpp
  src/utilities/geometry/Intersection.hpp
  src/utilities/geometry/Intersection.cpp
  src/utilities/geometry/Plane.hpp
  src/utilities/geometry/Plane.cpp
  src/utilities/geometry/Point3d.hpp
  src/utilities/geometry/Point3d.cpp
  src/utilities/geometry/ThreeJS.hpp
  src/utilities/geometry/ThreeJS.cpp
  src/utilities/geometry/Transformation.hpp
  src/utilities/geometry/Transformation.cpp
  src/utilities/geometry/Vector3d.hpp
  src/utilities/geometry/Vector3d.cpp
)

add_library(test_lib STATIC
  ${test_lib_src}
)

add_executable(test_exe
  src/main.cpp
)

target_link_libraries(test_exe test_lib)