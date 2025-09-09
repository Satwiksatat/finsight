FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build the application (disable type checking and linting)
ENV DISABLE_ESLINT_PLUGIN=true
ENV TSC_COMPILE_ON_ERROR=true
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
