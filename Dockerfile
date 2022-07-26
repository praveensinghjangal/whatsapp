FROM node:14.16.0-alpine

ENV TZ=Asia/Kolkata

ADD "package.json" /app/

WORKDIR /app

RUN apk add git

RUN apk add --no-cache \
        python3 \
        py3-pip \
    && pip3 install --upgrade pip \
    && pip3 install \
        awscli \
    && rm -rf /var/cache/apk/*
 
RUN aws --version 

RUN aws configure set default.region ap-south-1

RUN apk add openssh

RUN apk add nano

RUN npm install --production

RUN apk add --update tzdata && cp /usr/share/zoneinfo/Asia/Kolkata /etc/localtime

ADD . /app

VOLUME ["/var/log"]

RUN mkdir -p /var/log/node_apps/

EXPOSE 7777

RUN ./node_modules/.bin/jsdoc -c ./jsdoc.conf -d public/js-docs

CMD ["node", "server.js"]
