FROM node:22-slim
WORKDIR /app
COPY backend/ ./backend/
COPY src/ ./src/
COPY package.json .
RUN cd backend && npm install
ENV DB_PATH=/data/laguna.db
ENV PORT=3000
CMD ["node", "backend/server.js"]
