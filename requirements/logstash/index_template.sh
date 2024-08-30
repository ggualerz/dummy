#!/bin/bash

#Add an index template for the logstash syslog handler in elasticsearch

# Elasticsearch connection details
ELASTICSEARCH_HOST="elasticsearch"
ELASTICSEARCH_PORT="9200"
ELASTICSEARCH_USERNAME="${ELASTIC_USERNAME}"
ELASTICSEARCH_PASSWORD="${ELASTIC_PASSWORD}"
LOGSTASH_NEW_PASSWORD="${ELASTIC_LOGSTASH_PASSWORD}"
# Lock file
LOCK_FILE="/usr/share/logstash/data/.is_index_created"

# Check if the lock file (.is_index_created) exists
if [ -f "$LOCK_FILE" ]; then
    echo "Found $LOCK_FILE file. Skipping index creation."
else
    echo "Adding the index templace"
    curl -s -X PUT "https://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_template/transcendence_template" \
         -H "Content-Type: application/json" \
         -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
         -d '{
			  "index_patterns": ["transcendence-*"],  // Matches indices like "transcendence-2024-06-22"
			  "order": 1,
			  "settings": {
			    "number_of_shards": 1,
			    "number_of_replicas": 0, // Useless in single node infra
				"index.lifecycle.name": "transcendence_policy",
      			"index.lifecycle.rollover_alias": "transcendence"
			  },
			  "mappings": {
			      "properties": {
			        "@timestamp": {
			          "type": "date"
			        },
			        "priority": {
			          "type": "integer"
			        },
			        "month": {
			          "type": "keyword"
			        },
			        "day": {
			          "type": "integer"
			        },
			        "time": {
			          "type": "keyword"
			        },
			        "docker_tag": {
			          "type": "keyword"
			        },
			        "pid": {
			          "type": "integer"
			        },
			        "raw_message": {
			          "type": "text"
			        },
			        "log_level": {
			          "type": "keyword"
			        },
			        "log_message": {
			          "type": "text"
			        },
			        "client_ip": {
			          "type": "ip"
			        },
			        "year": {
			          "type": "integer"
			        },
			        "http_method": {
			          "type": "keyword"
			        },
			        "http_request": {
			          "type": "keyword"
			        },
			        "http_version": {
			          "type": "keyword"
			        },
			        "http_status": {
			          "type": "integer"
			        },
			        "http_response_size": {
			          "type": "integer"
			        },
			        "target_service": {
			          "type": "keyword"
			        },
			        "target_service_uri": {
			          "type": "keyword"
			        },
			        "http_response_time_ms": {
			          "type": "float"
			        }
			      }
				}
			}'

  if [ $? -ne 0 ]; then
    echo "Failed to create the syslog index template."
    exit 1
  fi
	touch $LOCK_FILE
	echo "The syslog template have been correctly created in elasticsearch !"
fi
