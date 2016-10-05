FROM node:4

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


COPY . /usr/src/app
RUN cd /usr/src/app && npm install --unsafe-perm=true

EXPOSE 8080 

CMD ["node","app.js"]


