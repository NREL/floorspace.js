#ifdef __EMSCRIPTEN__

  #include "Point3d.hpp"
  #include "Vector3d.hpp"
  #include "Geometry.hpp"

  #include "FloorplanJS.hpp"

  #include <emscripten.h>
  #include <emscripten/bind.h>
  using namespace emscripten;

  template<typename OptionalType>
  struct OptionalAccess {

      static bool is_initialized(const OptionalType& o) {
          return o.is_initialized();
      }

      static val get(const OptionalType& o) {
        if (o.is_initialized()) {
            return val(o.get());
        }
        return val::undefined();
      }

      static void set(OptionalType& o, const typename OptionalType::value_type& value) {
          o = value;
      }
  };

  template<typename T>
  class_<boost::optional<T>> register_optional(const char* name) {
    typedef boost::optional<T> OptionalType;

    return class_<boost::optional<T>>(name)
        .template constructor<>()
        .template constructor<T>()
        .function("is_initialized", &OptionalAccess<OptionalType>::is_initialized)
        .function("get", &OptionalAccess<OptionalType>::get)
        .function("set", &OptionalAccess<OptionalType>::set)
        ;
  }

  EMSCRIPTEN_BINDINGS(point3d_example) {

    register_optional<double>("OptionalDouble");
    register_optional<int>("OptionalInt");
    register_optional<unsigned>("OptionalUnsigned");
    register_optional<std::string>("OptionalString");

    class_<openstudio::Point3d>("Point3d")
      .constructor<double, double, double>()
      .function("x", &openstudio::Point3d::x)
      .function("y", &openstudio::Point3d::y)
      .function("z", &openstudio::Point3d::z)
      ;
    register_vector<openstudio::Point3d>("Point3dVector");
    register_optional<openstudio::Point3d>("OptionalPoint3d");

    class_<openstudio::Vector3d>("Vector3d")
      .constructor<double, double, double>()
      .function("x", &openstudio::Vector3d::x)
      .function("y", &openstudio::Vector3d::y)
      .function("z", &openstudio::Vector3d::z)
      ;
    register_vector<openstudio::Vector3d>("Vector3dVector");
    register_optional<openstudio::Vector3d>("OptionalVector3d");

    function("floorplanToThreeJS", &openstudio::floorplanToThreeJS);

    function("getArea", &openstudio::getArea);
    function("getOutwardNormal", &openstudio::getOutwardNormal);
    function("getCentroid", &openstudio::getCentroid);

  }

#endif