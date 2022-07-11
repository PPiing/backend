FROM node:slim
RUN mkdir backend
WORKDIR /backend
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["bash", "start.sh"]