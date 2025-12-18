FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Bind to the port defined by the environment variable
EXPOSE 3000

# Start the application
CMD [ "node", "index.js" ]
