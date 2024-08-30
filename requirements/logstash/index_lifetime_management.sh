#!/bin/bash

#Add an ilm for the logstash syslog handler in elasticsearch

# Elasticsearch connection details
ELASTICSEARCH_HOST="elasticsearch"
ELASTICSEARCH_PORT="9200"
ELASTICSEARCH_USERNAME="${ELASTIC_USERNAME}"
ELASTICSEARCH_PASSWORD="${ELASTIC_PASSWORD}"
LOGSTASH_NEW_PASSWORD="${ELASTIC_LOGSTASH_PASSWORD}"
# Lock file
LOCK_FILE="/usr/share/logstash/data/.is_ilm_created"

# Check if the lock file (.is_ilm_created) exists
if [ -f "$LOCK_FILE" ]; then
    echo "Found $LOCK_FILE file. Skipping ilm creation."
else
    echo "Adding the index templace"
    curl -s -X PUT "https://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_ilm/policy/transcendence_policy" \
         -H "Content-Type: application/json" \
         -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
         -d '{
        "policy": {
            "phases": {
                "hot": {
                    "min_age": "0ms",
                    "actions": {
                        "rollover": {
                            "max_size": "50gb",
                            "max_age": "1d"
                        },
                        "set_priority": {
                            "priority": 100
                        }
                    }
                },
                "warm": {
                    "min_age": "1d",
                    "actions": {
                        "allocate": {
                            "require": {
                                "box_type": "warm"
                            }
                        },
                        "forcemerge": {
                            "max_num_segments": 1
                        },
                        "set_priority": {
                            "priority": 50
                        }
                    }
                },
                "cold": {
                    "min_age": "7d",
                    "actions": {
                        "allocate": {
                            "require": {
                                "box_type": "cold"
                            }
                        },
                        "set_priority": {
                            "priority": 0
                        }
                    }
                },
                "delete": {
                    "min_age": "14d",
                    "actions": {
                        "delete": {}
                    }
                }
            }
        }
    }'

  if [ $? -ne 0 ]; then
    echo "Failed to create the syslog ilm template."
    exit 1
  fi
	touch $LOCK_FILE
	echo "The syslog ilm have been correctly created in elasticsearch !"
fi