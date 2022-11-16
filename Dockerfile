# Dokerfile for the fragments UI  

# Stage 0: install the base dependencies
FROM node:16.18.1-alpine@sha256:15dd66f723aab8b367abc7ac6ed25594ca4653f2ce49ad1505bfbe740ad5190e AS dependencies

LABEL maintainer="Gulnur Baimukhambetova <gbaimukhambetova@myseneca.ca>" \
    description="Fragments Front-End Web Testing UI"

ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Parcel build needs a few things to work on alpine
RUN apk add --update --no-cache g++ make python3 && ln -sf python3 /usr/bin/python

WORKDIR /app

COPY package* .

RUN npm ci 

#######################################################################

# Stage 1: build the site using dependencies 
FROM node:16.18.1-alpine@sha256:15dd66f723aab8b367abc7ac6ed25594ca4653f2ce49ad1505bfbe740ad5190e AS build

WORKDIR /app

COPY --from=dependencies /app /app 

COPY --from=dependencies /usr/bin/python /usr/bin/python

COPY . . 

RUN npm run build

####################################################################

# Stage 2: serve the final static web site
FROM nginx:stable-alpine@sha256:74694f2de64c44787a81f0554aa45b281e468c0c58b8665fafceda624d31e556 AS deploy

WORKDIR /app

ENV PORT=80

COPY --from=build /app/dist /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=1m --start-period=10s --retries=3 \
    CMD curl --fail localhost:${PORT} || exit 1