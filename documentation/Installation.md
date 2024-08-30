# Installation

## Dependencies

This project need docker, docker compose, gettext...

On a fresh Amazon Linux instance: docker, dockercompose v2, gettext, httpd-tools (for traefik pwd hash), make, git

The "aws_setup.sh" script is made to run on Amazon Linux, if you are running on another system, please install the depencies yourself. Most of RHEL based distro should work with this script

## Specs required

For the entire project, at least 4 GB of RAM, For only Transcendence around 1GB of RAM

## Running for the evaluation

This project can work on the computers of the 42Nice school but with obvious performance issue
So it was made to be tested on server acessible on Internet. Thus if you want to run it on a non acessible network, the ACME challenge will fail and Traefik will failover on the defaultcert. 
Also use an apropriate ACL for the administrative part of the project.

Use the init.sh script to launch the project, don't forget to hardset the discord_hook, the username of adm, django and postgre,..

## Running in production warning

Running init.sh is a bad idea for production, the project does not use binded volume and it can lead to issues for backuping the project. Also if you use init.sh don't forget to predifine the app secrets and store the passwords in a safe place.

Also the proxy can be setup outside of the project, the same for the monitoring services and the ELK stack. Feel free to adapt the docker-compose.yml

Also if you decided to not use the ELK stack, don't forget to remove all depends_on logstash and remove all loggind driver directives on the docker-compose.yml

Transcendence can be run only with the frontend backend and db container.

Use the init.sh to launch the project to test it, but implement it in a better way in your infrastructure

## Concerning the certificates

All the stack use full SSL container to container encryption, thus we generate our own CA and sign every certs when running init.sh. You can use your own CA and own certs for the app. It will not break anything if they have the correct name and alt name.

For the client to proxy, you can use the self generated certificate we provide with the init.sh or the let's encrypt cert resolver of Traefik. For the certresolover of traefik you will need a domain name, traefik container access to internet and in some case traefik http port accessible from internet. Go to documentation of the cert resolver of traefik, and the ACME challenge documentation.

## Secrets

The stack is not made to change the secrets after the first run, please do not do that or freset or fclean (IT WILL REMOVE ALL DATA)


## Monitoring

If you plan to use the stack on production, we strongly suggest to launch the ELK stack and the Monitoring stack from another place. ElasticSearch should be its own VM too. If you do it this way, all the part of auto setuping the stacks can be ignored.

In Transcendence it's requested that we use only one docker-compose.yml

Also ELK and the monitoring part consume a lot of ressources, use it only if you need it. It can be added after.

## Need Help ?

If you want to run it on your server it would be with pleasure, read the DevOps.md documentation for more insight on the project and for my contacts
