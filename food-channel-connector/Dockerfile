FROM node:18.13.0

WORKDIR /app

COPY ["package.json","./"]
COPY . .

RUN npm install -f

RUN npm run build

# Cài đặt PM2 toàn cục
RUN npm install pm2 -g

# Chạy ứng dụng bằng PM2
CMD ["pm2-runtime", "start", "npm", "--", "run", "start:dev"]
