# base image
FROM node:12-alpine

ARG workDir=/usr/local/app

# set working directory
WORKDIR ${workDir}

COPY build .

RUN yarn install -g pm2 --silent
RUN yarn global add serve && serve -s 

# start app
CMD ["serve", "-s", "./"]
