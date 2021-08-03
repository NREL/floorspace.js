/***********************************************************************************************************************
 *  OpenStudio(R), Copyright (c) 2008-2018, Alliance for Sustainable Energy, LLC. All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
 *  following conditions are met:
 *
 *  (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following
 *  disclaimer.
 *
 *  (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
 *  following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 *  (3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote
 *  products derived from this software without specific prior written permission from the respective party.
 *
 *  (4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative
 *  works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without
 *  specific prior written permission from Alliance for Sustainable Energy, LLC.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 *  INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR
 *  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 *  AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **********************************************************************************************************************/

#ifndef UTILITIES_CORE_LOGGER_HPP
#define UTILITIES_CORE_LOGGER_HPP

#include "../UtilitiesAPI.hpp"

#include <string>
#include <iostream>

// DLM: modified version of Logger.hpp

/// defines method logChannel() to get a logger for a class
#define REGISTER_LOGGER(__logChannel__)

/// log a message from within a registered class
#define LOG(__level__, __message__) \
{ \
  std::stringstream _ss1; \
  _ss1 << __message__; \
  openstudio::logFree(__level__, "", _ss1.str()); \
}

/// log a message from within a registered class and throw an exception
#define LOG_AND_THROW(__message__) \
{ \
  std::stringstream _ss1; \
  _ss1 << __message__; \
  openstudio::logFree(LogLevel::Fatal, "", _ss1.str()); \
  throw std::runtime_error(_ss1.str()); \
}

/// log a message from outside a registered class
#define LOG_FREE(__level__, __channel__, __message__) \
{ \
  std::stringstream _ss1; \
  _ss1 << __message__; \
  openstudio::logFree(__level__, __channel__, _ss1.str()); \
}

/// log a message from outside a registered class and throw an exception
#define LOG_FREE_AND_THROW(__channel__, __message__) \
{ \
  std::stringstream _ss1; \
  _ss1 << __message__; \
  openstudio::logFree(LogLevel::Fatal, __channel__, _ss1.str()); \
  throw std::runtime_error(_ss1.str()); \
}

enum LogLevel{Trace = -3, Debug = -2, Info = -1, Warn = 0, Error = 1, Fatal = 2};

namespace openstudio{

  /// convenience function for SWIG, prefer macros in C++
  inline UTILITIES_API void logFree(LogLevel level, const std::string& channel, const std::string& message)
  {
    if (level >= LogLevel::Warn){
      std::cout << level << " " << channel << ": " << message << std::endl;
    }
  }

} // openstudio

#endif // UTILITIES_CORE_LOGGER_HPP
