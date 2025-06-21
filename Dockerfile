# Use the official Node.js runtime as base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Expose port 3000
EXPOSE 3000

# Set hostname to 0.0.0.0 for accessibility
ENV HOSTNAME="0.0.0.0"

# Start the production server
CMD ["npm", "start"]