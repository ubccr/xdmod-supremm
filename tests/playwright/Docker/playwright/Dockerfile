FROM mcr.microsoft.com/playwright:v1.51.0-jammy

ENV GIT_BRANCH=${GIT_BRANCH:-playwright_poc}
ENV GIT_USER=${GIT_USER:-ubccr}
ENV XDMOD_SOURCE_DIR=${XDMOD_SOURCE_DIR:-/xdmod}
ENV XDMOD_REALMS=${XDMOD_REALMS:-jobs,cloud,storage}
ENV BASE_URL=${BASE_URL:-https://xdmod}

RUN apt update
RUN apt install -y iputils-ping vim procps
COPY bin /root/bin
RUN git clone --branch=$GIT_BRANCH --depth=1  https://github.com/$GIT_USER/xdmod.git $XDMOD_SOURCE_DIR
RUN npm upgrade -g npm -y
WORKDIR $XDMOD_SOURCE_DIR/tests/playwright
RUN npm install
RUN npx playwright install --with-deps chromium
ENTRYPOINT /root/bin/entrypoint.sh
