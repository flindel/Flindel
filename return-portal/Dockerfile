FROM node:12.8.1
WORKDIR /Users/ludi/Desktop/Flindel-intern/Fldl 2/return-portal
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV PORT 8080
CMD [ "npm", "start" ]