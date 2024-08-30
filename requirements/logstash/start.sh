#!/bin/bash

# Elasticsearch connection details
ELASTICSEARCH_HOST="elasticsearch"
ELASTICSEARCH_PORT="9200"
ELASTICSEARCH_USERNAME="${ELASTIC_USERNAME}"
ELASTICSEARCH_PASSWORD="${ELASTIC_PASSWORD}"
LOGSTASH_NEW_PASSWORD="${ELASTIC_LOGSTASH_PASSWORD}"
# Lock file
LOCK_FILE="/usr/share/logstash/data/.is_setup"

# Check if the lock file (.is_setup) exists
if [ -f "$LOCK_FILE" ]; then
    echo "Found $LOCK_FILE file. Skipping pwd change."
else
    echo "Changing logstash_system password"
    curl -s -X POST "https://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_security/user/logstash_system/_password" \
         -H "Content-Type: application/json" \
         -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
         -d "{
               \"password\" : \"${LOGSTASH_NEW_PASSWORD}\"
             }"

  if [ $? -ne 0 ]; then
    echo "Failed to change logstash_system password."
    exit 1
  fi
	touch $LOCK_FILE
	echo "logstash_system password changed !"
fi
#Create the index lifetime management policy ILM
/bin/bash /usr/share/logstash/index_lifetime_management.sh
#Create index template
/bin/bash /usr/share/logstash/index_template.sh
#Import dashboard ans data view and other stuff
/usr/bin/curl -X POST https://kibana:5601/adm/kibana/api/saved_objects/_import?overwrite=true -H "kbn-xsrf: true" --form file=@objects_import.ndjson -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}"
# Start Logstash
/usr/local/bin/docker-entrypoint