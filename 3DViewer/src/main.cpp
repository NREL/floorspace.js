#include "./utilities/geometry/Point3d.hpp"
#include "./utilities/geometry/Vector3d.hpp"
#include "./utilities/geometry/FloorplanJS.hpp"
#include "./utilities/core/UUID.hpp"

#include <string>
#include <fstream>
#include <streambuf>

using namespace openstudio;

int main(int argc, char *argv[]){

  if (argc != 2){

    std::cout << "Running examples" << std::endl;

    Point3d p(1, 2, 3);
    Vector3d v(4, 5, 6);

    std::cout << p << std::endl;
    std::cout << v << std::endl;

    Point3d p2 = p + v;

    std::cout << p2 << std::endl;

    UUID uuid = createUUID();
    std::string uuidString = toString(uuid);
    UUID uuid2 = toUUID(uuidString);

    return 0;
  }

  std::ifstream t(argv[1]);
  std::string str;

  t.seekg(0, std::ios::end);
  str.reserve(t.tellg());
  t.seekg(0, std::ios::beg);

  str.assign((std::istreambuf_iterator<char>(t)),
              std::istreambuf_iterator<char>());

  std::string threeJS = floorplanToThreeJS(str, false);

  std::cout << threeJS;

  return 0;
}