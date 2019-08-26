FROM node:12
WORKDIR /usr/src/flindel
COPY package*.json ./
RUN npm install
COPY . .
RUN npm build
ENV PORT 8080
CMD [ "npm", "start" ]