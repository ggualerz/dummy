FROM		logstash:8.14.1

LABEL		author="ggualerz@student.42nice.fr"

USER 0
# Install CA certificates package
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

# Copy your custom CA
COPY CA.crt /usr/local/share/ca-certificates/CA.crt

# Update the certificate store
RUN update-ca-certificates


#Add my keys
RUN mkdir /ssl
COPY *.crt /ssl/
COPY *.key /ssl/

COPY logstash.yml /usr/share/logstash/config/logstash.yml
COPY logstash.conf /usr/share/logstash/pipeline/logstash.conf

RUN chown 1000 /usr/share/logstash/config/logstash.yml
RUN chown 1000 /usr/share/logstash/pipeline/logstash.conf
RUN chown -R 1000 /ssl

COPY start.sh /usr/share/logstash/start.sh
RUN chmod +x /usr/share/logstash/start.sh
RUN chown 1000 /usr/share/logstash/start.sh

COPY index_template.sh  /usr/share/logstash/index_template.sh
RUN chmod +x /usr/share/logstash/index_template.sh
RUN chown 1000 /usr/share/logstash/index_template.sh

COPY index_lifetime_management.sh  /usr/share/logstash/index_lifetime_management.sh
RUN chmod +x /usr/share/logstash/index_lifetime_management.sh
RUN chown 1000 /usr/share/logstash/index_lifetime_management.sh

COPY objects_import.ndjson /usr/share/logstash/objects_import.ndjson
RUN chmod +x /usr/share/logstash/objects_import.ndjson
RUN chown 1000 /usr/share/logstash/objects_import.ndjson

#FOR SYSLOG OVER TLS
EXPOSE 6514

USER 1000

ENTRYPOINT ["/usr/share/logstash/start.sh"]