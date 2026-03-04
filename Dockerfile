#https://docs.docker.com/guides/reactjs/containerize/

ARG NODE_VERSION=24.11.1
ARG NGINX=alpine3.23

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

COPY package*.json* .

# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

RUN npm run build

FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app
# Copy the static build output from the build stage to Nginx's default HTML serving directory
COPY --from=builder /app/dist /app/dist

RUN npm i -g serve

EXPOSE 5173

CMD [ "serve", "-s", "dist", "-p", "5173" ]