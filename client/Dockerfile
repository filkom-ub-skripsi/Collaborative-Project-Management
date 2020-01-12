# base image
FROM node:12-alpine

ARG workDir=/usr/local/app

# set working directory
WORKDIR ${workDir}

COPY build .

RUN yarn global add serve pm2 --silent

# start app
CMD ["serve", "-s", "./"]
