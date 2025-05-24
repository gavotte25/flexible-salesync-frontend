FROM node:alpine

WORKDIR /home/salesync

COPY . /home/salesync

RUN npm i

CMD ["npm", "run", "dev", "--", "--host"]