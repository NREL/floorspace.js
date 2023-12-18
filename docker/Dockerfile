FROM --platform=linux/amd64 httpd:latest AS floorspacejs-dev

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y npm

ADD . /app
WORKDIR /app

RUN npm install --global yarn && yarn install --frozen-lockfile && yarn wp:build

# Cleanup
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*

