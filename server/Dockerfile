# base image
FROM node:12-alpine

ARG workDir=/usr/local/app
ARG MONGO_URI
ARG PORT
ARG YARN_CACHE_FOLDER=/tmp/.yarn-cache

ENV MONGO_URI=${MONGO_URI}
ENV PORT=${PORT}

# set working directory
WORKDIR ${workDir}

COPY . .

RUN yarn global add pm2 --silent
# install and cache app dependencies
RUN yarn install --silent

# add $PATH
ENV PATH ${workDir}/node_modules/.bin:$PATH


# start app
CMD ["yarn", "start"]
