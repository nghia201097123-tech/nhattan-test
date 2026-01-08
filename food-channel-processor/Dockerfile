FROM node:18.13.0

WORKDIR /app

COPY ["package.json","./"]
COPY . .

RUN npm install -f

RUN npm run build

CMD ["npm", "run", "start:dev"]