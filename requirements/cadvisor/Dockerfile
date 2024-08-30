FROM gcr.io/cadvisor/cadvisor:v0.49.1
LABEL	author="ggualerz@student.42nice.fr"
# Install CA certificates package
RUN apk update && apk add ca-certificates && update-ca-certificates

# Copy your custom CA
COPY CA.crt /usr/local/share/ca-certificates/CA.crt

# Update the certificate store
RUN update-ca-certificates

#SSL
#Add my keys
RUN mkdir /ssl
COPY *.crt /ssl/
COPY *.key /ssl/


ENV CADVISOR_HEALTHCHECK_URL=http://localhost:8080/adm/cadvisor/healthz
