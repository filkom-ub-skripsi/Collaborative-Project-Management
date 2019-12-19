# base image
FROM node:12-alpine

ARG workDir=/usr/local/app
ARG MONGO_URI
ARG PORT

ENV MONGO_URI=${MONGO_URI}
ENV PORT=${PORT}

# set working directory
WORKDIR ${workDir}

# install and cache app dependencies
COPY . .

# RUN npm install --silent
# COPY node_modules .

# add $PATH
ENV PATH ${workDir}/node_modules/.bin:$PATH


# start app
CMD ["npm", "start"]
