#!/bin/bash

#This script is made to quickly install all dependencies on Amazon Linux with the ec2-user
#This script should be run as root

if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run with sudo"
  exit 1
fi

dnf install git docker gettext httpd-tools make jq -y
#Add websocket port on SElinux
semanage port -l | grep 4433
if [ $? -ne 0 ]; then
        semanage port -a -t http_port_t -p tcp 4433
        echo "Created port 4433 SELinux rule"
fi

#Installing docker compose v2 https://docs.docker.com/compose/install/linux/#install-the-plugin-manually
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.29.2/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

#Add current user to docker group
usermod -aG docker ec2-user


#Enabling and starting docker
systemctl enable docker
systemctl start docker

echo "AWS Dependency are installed"
echo "Don't forget to refresh the group of your user"
