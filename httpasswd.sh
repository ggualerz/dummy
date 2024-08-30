#!/bin/bash

#This script intend to replace the usage of  echo $(htpasswd -nB user) | sed -e s/\\$/\\$\\$/g
# For Traefik basic auth
#By using an online API, use it only in the case where you can't install httpasswd, like in 42 school computers

# Set variables
username=$1
password=$2 # Replace with your password
cost=10 #cost reprensent the complexity of the hash, cost of 10 is suited for Traefik

# Generate bcrypt hash using Toptal API
response=$(curl -s --request POST --data "password=$password&cost=$cost" https://www.toptal.com/developers/bcrypt/api/generate-hash.json)

# Extract the hash from the response
hash=$(echo $response | jq -r '.hash')

# Replace single $ with $$ for docker compose.yml support
final_hash=$(echo "$hash" | sed -e 's/\$/\$\$/g')

# Output in htpasswd format
echo "$username:$final_hash"
