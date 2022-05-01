FROM node:latest
RUN mkdir backend
WORKDIR /backend
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]