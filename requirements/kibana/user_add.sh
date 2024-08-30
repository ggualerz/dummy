#!/bin/bash

#Add an user to ES for Kibana with the creds of the traefik midleware

# Elasticsearch connection details
ELASTICSEARCH_HOST="elasticsearch"
ELASTICSEARCH_PORT="9200"
ELASTICSEARCH_USERNAME="${ELASTIC_USERNAME}"
ELASTICSEARCH_PASSWORD="${ELASTIC_PASSWORD}"
LOGSTASH_NEW_PASSWORD="${ELASTIC_LOGSTASH_PASSWORD}"
# Lock file
LOCK_FILE="/usr/share/kibana/data/.is_user_created"

# Check if the lock file (.is_user_created) exists
if [ -f "$LOCK_FILE" ]; then
    echo "Found $LOCK_FILE file. Skipping user creation."
else
    echo "Adding the index templace"
    curl -s -X PUT "https://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_security/user/${ADM_USER}" \
         -H "Content-Type: application/json" \
         -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
         -d '{
			  "password" : "'"${ADM_PASSWD_UNCIPHERED}"'",
			  "roles" : [ "superuser"],
			  "full_name" : "Transcendence wide admin",
			  "email" : "ggualerz@student.42nice.fr",
			  "metadata" : {
			    "intelligence" : 7
			  },
			  "enabled": true
			}'

  if [ $? -ne 0 ]; then
    echo "Failed to create the user."
    exit 1
  fi
	touch $LOCK_FILE
	echo "The user have been correctly created in elasticsearch !"
fi
