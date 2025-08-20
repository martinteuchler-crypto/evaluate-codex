FROM node:18-alpine AS base
WORKDIR /app
COPY package.json tsconfig.json .eslintrc.js .prettierrc ./
COPY packages ./packages
COPY apps/server ./apps/server
# Install full workspace dependencies to build TypeScript, then prune
RUN npm install --workspaces \
  && npm run build --workspace=@three-chess/engine \
  && npm run build --workspace=@three-chess/server \
  && npm prune --workspaces --production
CMD ["node", "apps/server/dist/index.js"]
