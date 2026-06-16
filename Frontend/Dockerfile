# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We build the application. Make sure to define build time envs if needed.
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
ARG VITE_GOOGLE_MAPS_API
ENV VITE_GOOGLE_MAPS_API=$VITE_GOOGLE_MAPS_API
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
