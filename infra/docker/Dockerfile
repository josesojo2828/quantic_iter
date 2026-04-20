FROM node:20-alpine

ARG SERVICE_PATH

WORKDIR /app

# Install dependencies for the shared library if needed
COPY libs/shared /libs/shared
RUN cd /libs/shared && npm install && npm run build

# Install service dependencies
COPY ${SERVICE_PATH}/package*.json ./
# Remove lockfile inside container to avoid 'extraneous' errors with file: dependencies
RUN rm -f package-lock.json && npm install

# Copy source
COPY ${SERVICE_PATH} .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
