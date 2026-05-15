FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM base AS build
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base  /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist
COPY package.json ./

EXPOSE 3001

# Run any pending TypeORM migrations before starting the server.
# This is a no-op when the schema is already up-to-date.
CMD ["sh", "-c", \
  "node node_modules/typeorm/cli.js migration:run -d dist/typeorm.config.js \
   && node dist/main"]
