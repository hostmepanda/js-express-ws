FROM node:lts-buster

RUN apt-get update && apt-get -y upgrade

RUN ln -sf /usr/share/zoneinfo/Europe/Moscow /etc/localtime

RUN mkdir -p /var/www/js-express-ws-node

COPY . /var/www/js-express-ws-node

WORKDIR /var/www/js-express-ws-node

CMD ["yarn", "install"]
CMD ["yarn", "dev"]
