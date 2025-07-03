# Step 1: Use an official Node.js runtime as a parent image
FROM node:22-alpine

ARG NPM_TOKEN
ARG SENTRY_AUTH_TOKEN
ARG DOPPLER_TOKEN
ARG DOPPLER_PROJECT
ARG DOPPLER_CONFIG
# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json into the container
COPY package*.json ./

# Step 4: Install dependencies
COPY .npmrc ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm i

# Step 5: Copy the rest of your application into the container
COPY . .
RUN npm install -g @nestjs/cli
# Step 6: Build the Next.js application
RUN SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN} npm run build

# Install Redis
RUN apk add redis

#Install Doppler CLI
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler
    
# Step 7: Expose port 8000 to access the app
EXPOSE 3001 6379
COPY start.sh /start.sh
RUN chmod +x /start.sh

ENV DOPPLER_TOKEN=${DOPPLER_TOKEN}
ENV DOPPLER_PROJECT=${DOPPLER_PROJECT}
ENV DOPPLER_CONFIG=${DOPPLER_CONFIG}
# Step 8: Run the Next.js app on port 8000 in production mode
CMD ["/start.sh"]