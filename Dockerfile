FROM node:10-alpine

ENV TZ=Asia/Kolkata

ADD "package.json" /app/

WORKDIR /app

RUN npm install --production

RUN apk add --update tzdata && cp /usr/share/zoneinfo/Asia/Kolkata /etc/localtime

ADD . /app

VOLUME ["/var/log"]

RUN mkdir -p /var/log/node_apps/

EXPOSE 7777

CMD ["node", "server.js"]
