FROM node:latest
RUN mkdir backend
WORKDIR /backend
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD [ "npm", "run", "seed:run" ]
ENTRYPOINT [ "npm", "run", "start:prod" ]