FROM node:8-alpine
# build environment argument
ARG BUILD_ENV
# setting node environment before build
ENV NODE_ENV=$BUILD_ENV

RUN mkdir -p /service
#Setting the work dir
WORKDIR /service
#Copy json file to install the libraries
COPY . /service
#Install global packages and libraries for application

RUN npm install --no-optional

#Expose to the API port
EXPOSE 8080

#Starting the service
CMD export PORT=8080 && npm start