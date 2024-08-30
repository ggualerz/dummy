#!/bin/bash

# Elasticsearch connection details
ELASTICSEARCH_HOST="elasticsearch"
ELASTICSEARCH_PORT="9200"
ELASTICSEARCH_USERNAME="${ELASTIC_USERNAME}"
ELASTICSEARCH_PASSWORD="${ELASTIC_PASSWORD}"
KIBANA_NEW_PASSWORD="${ELASTIC_KIBANA_PASSWORD}"
# Lock file
LOCK_FILE="/usr/share/kibana/data/.is_setup"

# Check if the lock file (.is_setup) exists
if [ -f "$LOCK_FILE" ]; then
    echo "Found $LOCK_FILE file. Skipping pwd change."
else
    echo "Changing Kibana_system password"
    curl -s -X POST "https://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_security/user/kibana_system/_password" \
         -H "Content-Type: application/json" \
         -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
         -d "{
               \"password\" : \"${KIBANA_NEW_PASSWORD}\"
             }"

  if [ $? -ne 0 ]; then
    echo "Failed to change kibana_system password."
    exit 1
  fi
	touch $LOCK_FILE
	echo "kibana_system password changed !"
fi
#Add traefik admin user
/bin/bash /usr/share/kibana/user_add.sh
# Start Kibana
/bin/bash -- /usr/local/bin/kibana-docker