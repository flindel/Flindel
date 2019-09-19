FROM node:12.8.1
WORKDIR /usr/src/fldl-internal
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT 8080
CMD [ "npm", "start" ]