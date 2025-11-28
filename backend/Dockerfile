# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built application
COPY --from=build /app .

# Expose the port the app runs on
EXPOSE 5001

# Start the application
CMD ["node", "index.js"]
