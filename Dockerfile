FROM node:20
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm -r build
CMD ["pnpm","--filter","server","start"]
