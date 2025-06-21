# Use the official Node.js runtime as base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Set hostname to 0.0.0.0 for accessibility
ENV HOSTNAME="0.0.0.0"

# Start the production server
CMD ["npm", "start"]