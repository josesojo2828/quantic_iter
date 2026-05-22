FROM node:20-alpine

ARG SERVICE_PATH

WORKDIR /app

# Install dependencies for the shared library if needed
COPY libs/shared /libs/shared
RUN cd /libs/shared && npm install && npm run build

# Install service dependencies
COPY ${SERVICE_PATH}/package*.json ./
# Increased timeout and retries + removing lockfile to avoid 'extraneous' error
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    rm -f package-lock.json && \
    npm install --network-timeout=120000

# Copy source
COPY ${SERVICE_PATH} .

# Generate Prisma client if schema exists
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; fi

# Build the service/application
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
