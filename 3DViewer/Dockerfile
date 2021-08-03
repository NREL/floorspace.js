FROM emscripten/emsdk:2.0.26

RUN echo "## Start building" \
    \
&&	echo "## Update and install packages" \
    &&	apt-get -qq -y update \
    # mitigate problem with create symlink to man
    &&  mkdir -p /usr/share/man/man1/ \
    &&  apt-get -qq install -y --no-install-recommends \
            wget \
            curl \
            zip \
            unzip \
            git \
            ssh-client \
            ca-certificates \
            build-essential \
            make \
            ant \
            libidn11 \
            openjdk-8-jre-headless \
    \
&&	echo "## Installing CMake" \
    &&	wget https://cmake.org/files/v3.18/cmake-3.18.3-Linux-x86_64.sh -q \
    &&	mkdir /opt/cmake \
    &&	printf "y\nn\n" | sh cmake-3.18.3-Linux-x86_64.sh --prefix=/opt/cmake > /dev/null \
    &&		rm -fr cmake*.sh /opt/cmake/doc \
    &&		rm -fr /opt/cmake/bin/cmake-gui \
    &&		rm -fr /opt/cmake/bin/ccmake \
    &&		rm -fr /opt/cmake/bin/cpack \
    &&	ln -s /opt/cmake/bin/cmake /usr/local/bin/cmake \
    &&	ln -s /opt/cmake/bin/ctest /usr/local/bin/ctest

RUN mkdir -p /src

RUN wget https://phoenixnap.dl.sourceforge.net/project/boost/boost/1.55.0/boost_1_55_0.tar.gz && \
    tar -zxvf boost_1_55_0.tar.gz && \
    mv boost_1_55_0/boost /boost

ADD build.sh /build.sh

ENTRYPOINT [ "/bin/bash", "/build.sh" ]
