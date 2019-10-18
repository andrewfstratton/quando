# base image - ubit.js compiled against this version and not 12, so we have to use this
FROM node:lts-jessie

# set working directory
RUN mkdir /opt/quando
WORKDIR /opt/quando

# add `/opt/quando/node_modules/.bin` to $PATH
ENV PATH /opt/quando/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /opt/quando/package.json
# "|| :" prevents this command from failing temporarily while RobotJS is broken
RUN npm run install_local || :
COPY . /opt/quando

# start app
EXPOSE 80
EXPOSE 5984
CMD ["/bin/sh", "/opt/quando/entrypoint.sh"]
