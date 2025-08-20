FROM node:18-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json .eslintrc.js .prettierrc ./
COPY packages ./packages
COPY apps/client ./apps/client
COPY infra/nginx.conf ./infra/nginx.conf
RUN npm install --workspaces && npm run build --workspace=@three-chess/client

FROM nginx:alpine
COPY --from=build /app/apps/client/dist /usr/share/nginx/html
COPY --from=build /app/infra/nginx.conf /etc/nginx/conf.d/default.conf
