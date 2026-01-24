# uses node image
FROM node:20

# sets working dir
WORKDIR /app

# copies packages
COPY package*.json ./

# install dependencies
RUN npm install

# copies code
COPY . .

# exposes backend ( for local usage on server )
EXPOSE 5000

# runs index with nodemon for dev changing causing "instant" updates
CMD ["npx", "nodemon", "api/index.js"]