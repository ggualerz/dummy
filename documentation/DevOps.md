# DevOps

This file intend to inform how was structured the project, please do not copy paste the infrastructure. Search on your side the best way to do something. Something relevant today can be irrelevant tomorrow specially in the SysOps world. Also some part can be overkill because we understood a specific line of the subject wrongly. (Hi HTTPS line)

Always try to do your best, the safest way and take from it the maximum knowledge. And of course comply to the rules of this subject.

## Infra description

### Proxy

Traefik v3 is our proxy, its main purpose is to ensure a single entrypoint into the stack for the client

It handle all HTTP(80), HTTPS(443) and WebsocketHTTPS(4433). HTTP is handled only to redirect to HTTPS(443)

His main goal is to centralized all connexion, so it can serve as a reverse proxy on subpath, it can also generate metrics usefull for monitoring.

It can also handle all Let's Encrypt Challenges, sadly it cannot work when submited to evaluation.

Traefik also add midlewares to restrain access to administrative paths (/adm/*)

### PKI

The choice have been made to generate our own PKI when launching the project

All containers trust the CA

Each container have one or more cert and private key

The traffic between containers is always encrypted with those certs

### Monitoring

Monitoring containers are, Prometheus, Grafana , cAdvisor and Postgres_Exporter

Prometheus fetch metrics from all application, infra or db related containers.
Thoses fetch are only performed in an encrypted way, throught SSL connections
Thoses metrics are used for Grafana
The Grafana legacy login was removed, the ACL and login form are handled directly by Traefik

Also if you have a "fetch failed" popup on grafana, please disable uBlock

cAdvisor will monitoring the host of the docker stack, it can be ressources intensive, it can be disabled but Grafana will not monitor the docker host anymore.

### ELK

All ELK infra if auto provisioned, with API call

#### ElasticSearch

Elastic search is deployed with the official image of elasticsearch
No entrypoint override
Custom CA and certs are included in the Dockerfile
SSL is forced to commicate with its own API
Elastic password is set in the .env file
Elastic is set to work as a single-node

#### Kibana

Kibana is deployed with the offical image of Kibana
The entrypoint is override to make an API call at Elastic to change the kibana_system password
Kibana will use this new password to connect to elasticsearch with the legacy method (username/password)

##### Logstash

Logstash is deployed with the officail image of Logstash
The entrypoint is override to make several API calls at Elastic to change the logstash_system password and create Index template
Logstash then will use this new password to connect to elastisearch with the legacy method (username/password)
Logstash also transform incoming syslog TCP+TLS to elasticsearch input, each client is authentificated in a strong way with a CA match.

#### Logging Driver

We use the built-in logging syslog driver of Docker to send the log to logstash.
This is restraining because logstash should be up to let the other container starting without an unexpected exit from docker. That's why every Transcendence container (Proxy,Backend,Frontend,DB) Wait for Logstash to be up. If you dont want to start ELK stack, comment out all logging: directive on the docker compose and of course all depends_on: logstash:

One way to avoid this thing would be to use logspout, but it is poorly integrated to run with logstash

You can also use GELF driver on UDP or Syslog on UDP, docker will not wait for a response from logstash then. But, it doesn't support TLS encryption, so in a way it can be against the minimal requirement of the subject. This is subject to interpretation too.

### ModSecurity and HashiCorp Vault

At the begining it was planned to do this part, Traefik integrate with a third party plugin a connector to OWASP ModSecurtity, the integration seem easy.

Then HashiCorp vault seem way more harder to implement. We didn't found a way to implement it without too much side effect on the actual project. It's possible, but it need to re-engineer all the init process, causse the vault should be populate before all the containers start. Then all containers should do API calls to get their secrets with some ACL made on the Vault.

## Todo before submiting

Need to set a whitelist on the grafana access for validating the subject (need to be on school env)\

Remove every image tag from docker compose

Host the server on aws 4Go

## Todo

- Inject all the code with the docker images

- Test again AWS and school, all services

- aws pb certificat
- aws pb traefik redir

## Thanks to

All the members of my team, thepaqui mmidon bbourret ndesprez. Also to fbardeau, mla-rosa and Tac (bocal of Nice), Raphaël Mauro too a friend of mine and a certified ElasticSearch professional.

## Have a question ?

I'm ggualerz (slack) from 42Nice, you can DM me if you have a question.
I'm also available on my student mail ggualerz@student.42nice.fr
