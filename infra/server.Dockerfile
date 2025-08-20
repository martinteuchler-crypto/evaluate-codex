FROM node:18-alpine
WORKDIR /app
COPY package.json tsconfig.json .eslintrc.js .prettierrc ./
COPY packages ./packages
COPY apps/server ./apps/server
RUN npm install --workspaces --production \
  && npm run build --workspace=@three-chess/engine \
  && npm run build --workspace=@three-chess/server
CMD ["node", "apps/server/dist/index.js"]
