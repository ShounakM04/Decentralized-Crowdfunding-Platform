FROM node:18

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install --legacy-peer-deps --omit=optional

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]