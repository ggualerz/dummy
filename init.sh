#!/bin/bash

#For real production scenario, please hard set those variables in the SET PART
#For an advanced production scenario (distant elk, monitoring,..) don't use the script an implement yourself the app on your infra
#This script was only made to get an easier evaluation process in 42school and allowing to dev on multiple branch on the same server, hosted in the dressing of ggualerz
#Also if you want to have persistent data safer than unbinded volume, bind the volumes to a local path and backup with a third party app like Veeam, we don't use binded volumes cause it can give issue for root less mode (source: ft_trannscendence subject)
#Also for prod use, generate your certs yourself

########### DO NOT TOUCH ##########################################################################
# Envfile path
ENVFILE=./.env
#Clean and fclean specific actions
if [[ $1 == "clean" ]]; then
	make $1
	exit 0
fi
if [[ $1 == "fclean" ]]; then
	make $1
	rm $ENVFILE
	exit 0
fi

# Exit immediately if any command fails
set -e

#Do the env file exist ? it will trigger something according to the makefile
if [ -f "$ENVFILE" ]; then

	if [[ $1 != "freset" ]]; then
		echo ".env file already exist, execution normally"
		make $1
		exit 0
	fi
	rm $ENVFILE
	echo "freset mode, deletion of the .env"	
fi
####################################################################################################


#####################################################################################################
### SETER MANDATORY VARS
#####################################################################################################

#Fully Qualified Domain Name (comment it and it will use the machine hostname)
echo "RUSTINE"
clear
echo "For the evaluation process of ft_transcendence, you have to set the next variables by answering questions"
echo "Enter the FQDN (default is $(hostname))"
read FQDN
: "${FQDN:=$(hostname)}"

clear
echo "Use the default docker socket or the one for root less mode ? (1) for normal, (2) for root less mode"
read -r input
case $input in
    1)
        echo "Normal mode selected"
        DOCKER_SOCKET=/var/run/docker.sock
        ;;
    2)
        echo "Rootless mode selected"
        DOCKER_SOCKET=/run/user/$(id -u)/docker.sock
        ;;
    *)
        echo "Invalid option. Exiting..."
        exit 1
        ;;
esac

clear
echo "Use the httpasswd binary or the API curls for generating the basic_auth for traefik ? (1) for binary, (2) for API calls"
read -r input
case $input in
    1)
        echo "Binary mode selected"
        HOW_HTTPASSWD=apache2-tools
        ;;
    2)
        echo "API mode selected"
        HOW_HTTPASSWD=API
        ;;
    *)
        echo "Invalid option. Exiting..."
        exit 1
        ;;
esac

clear
echo "Provide the discord webhook for notification of prometheus"
read DISCORD_WEBHOOK

clear
echo "Provide the ACL mask for acessing /adm/* pages (Kibana,Grafana,...) the default value is (0.0.0.0/0) it let everybody accessing it"
read IP_TO_WHITELIST
: "${IP_TO_WHITELIST:=0.0.0.0/0}"

clear
echo "Provide an username for /adm/* ressources, default is (opschid)"
read ADM_USERNAME
: "${ADM_USERNAME:=opschid}"

clear
echo "Provide an username for django super user, default is (djachid)"
read DJANGO_USERNAME
: "${DJANGO_USERNAME:=djachid}"
echo "Provide an email for django super user, default is (djachid@42nice.fr)"
read DJANGO_MAIL
: "${DJANGO_MAIL:=djachid@42nice.fr}"

clear
echo "Provide the db name and db username used by transcendence, default is (transcendence)"
POSTGRES_USERNAME=transcendence
read POSTGRES_USERNAME
: "${POSTGRES_USERNAME:=transcendence}"

clear
echo "Provide Front HTTPS port (>1024 for rootless mode) (default is 443)"
read FRONT_PORT
: "${FRONT_PORT:=443}"
echo "Provide Front HTTP port (>1024 for rootless mode) (default is 80)"
read FRONT_HTTP_PORT
: "${FRONT_HTTP_PORT:=80}"
echo "Provide Front Websocket port (>1024 for rootless mode) (default is 4433)"
read WEBSOCKET_PORT
: "${WEBSOCKET_PORT:=4433}"
echo "Provide SSL Logstash syslog port (>1024 for rootless mode) (default is 6514)"
read LOGSTASH_PORT
: "${LOGSTASH_PORT:=6514}"


#Generation of django secrets
DJANGO_SECRET_KEY=$(openssl rand -base64 45 | tr -dc 'a-zA-Z0-9!@#$%^&*(-_=+)' | fold -w 50 | head -n 1)
DJANGO_SECRET_KEY_FALLBACK=$(openssl rand -base64 45 | tr -dc 'a-zA-Z0-9!@#$%^&*(-_=+)' | fold -w 50 | head -n 1)

clear

####################################################################################################
###DO NOT EDIT ANYTHING AFTER THIS LINE
####################################################################################################

#Check if a mandatory var is not set##############################################
vars_to_check=("DISCORD_WEBHOOK" "DOCKER_SOCKET" "HOW_HTTPASSWD" "IP_TO_WHITELIST" "ADM_USERNAME" "DJANGO_USERNAME" "DJANGO_MAIL" "POSTGRES_USERNAME" "DJANGO_SECRET_KEY" "DJANGO_SECRET_KEY_FALLBACK")
all_set=true
# Check each variable
for var in "${vars_to_check[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: $var is not set or is empty"
    all_set=false
  fi
done
# Exit with status 1 if any variable is not set or is empty
if [ "$all_set" = false ]; then
  exit 1
fi
####################################################################################





#Welcome Banner

echo -e "\033[0;32m[INFO]\e[0m\t Welcome to ft_transcendence by:\n\t thepaqui, mmidon, bbourret, nsdeprez, ggualerz \n\t This project with all the services (Monitoring and ELK) can consume a huge ammount of RAM\n\t Please consider to run the full project on a server with at least 4GB of RAM available\n\t Press ENTER to continue..."
read -r

#Useless line to prevent user to modify the init.sh script
echo "INFO_ENV=DO_NOT_MODIFY_THIS_FILE_ITS_OVERIDE_BY_THE_INIT.SH_SCRIPT" >> $ENVFILE

#FQDN Construction

echo "FQDN=${FQDN}" >> $ENVFILE
echo "NEXT_PUBLIC_FQDN=${FQDN}" >> $ENVFILE

# echo -e "\033[33m[WARN]\e[0m\t The current Fully Qualified Domain Name of the App is ${FQDN}\n\t If it's not correct hard set it in init.sh first lines\n\t Press ENTER to continue..."
# read -r

# #Devops or not devops build
# 	## Monitoring decision
# 	read -p "Do you want to use monitoring services? (yes/no): " choice
# 	echo "PROFILES_COMPOSE_1=--profile" >> $ENVFILE
# 	echo "PROFILES_COMPOSE_2=main" >> $ENVFILE
# 	if [[ $choice == "yes" ]]; then
# 		echo "PROFILES_COMPOSE_3=--profile" >> $ENVFILE
# 		echo "PROFILES_COMPOSE_4=monitoring" >> $ENVFILE
# 	elif [[ $choice == "no" ]]; then

# 		echo "PROFILES_COMPOSE_3=" >> $ENVFILE
# 		echo "PROFILES_COMPOSE_4=" >> $ENVFILE
# 	else
# 	    echo "Invalid choice. Please enter 'yes' or 'no'."
# 	fi

# 	## ELK Decision
# 	read -p "Do you want to use ELK services? (yes/no): " choice
# 	if [[ $choice == "yes" ]]; then
# 		echo "PROFILES_COMPOSE_5=--profile" >> $ENVFILE
# 		echo "PROFILES_COMPOSE_6=elk" >> $ENVFILE
# 		echo -e "\033[33m[WARN]\033[0m\t ELK is enabled,some logs will be only visible from docker log command or Kibana \n\t Please use Kibana to search logs\n\t Press ENTER to continue..."
# 		read -r
# 		./set_elk.sh true
# 	elif [[ $choice == "no" ]]; then
# 		echo "PROFILES_COMPOSE_5=" >> $ENVFILE
# 		echo "PROFILES_COMPOSE_6=" >> $ENVFILE
# 		echo -e "\033[91m[TO DO]\033[0m\t ELK is Disabled,\n\t\t all lines of the docker compose file ending with #ELK_LINES will be commented out\n\t\t Press ENTER to continue..."
# 		read -r
# 		./set_elk.sh false
# 	else
# 	    echo "Invalid choice. Please enter 'yes' or 'no'."
# 	fi



#All env variable to set in the .env and to use in the templates
	
	#Directory Structure
	echo "REQUIREMENTS_DIR=$(pwd)/requirements" >> $ENVFILE
	echo "CA_DIR=$(pwd)/requirements" >> $ENVFILE

	# #Project relative, only used for the dev environment
	GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
	echo "PROJECT_NAME=${GIT_BRANCH}" >> $ENVFILE
	# echo "Debug: Current branch is $GIT_BRANCH"
	# if [ "$GIT_BRANCH" == "main" ]; then
	# 	PROJECT_PORT_ID=502
	# elif [ "$GIT_BRANCH" == "proxy" ]; then
	# 	PROJECT_PORT_ID=501
	# elif [ "$GIT_BRANCH" == "mmidon" ]; then
	# 	PROJECT_PORT_ID=503
	# elif [ "$GIT_BRANCH" == "bebzouz" ]; then
	# 	PROJECT_PORT_ID=504
	# elif [ "$GIT_BRANCH" == "jaapet" ]; then
	# 	PROJECT_PORT_ID=505
	# else
	# 	PROJECT_PORT_ID=0
	# fi
	# echo "Debug: PROJECT_PORT_ID is $PROJECT_PORT_ID"
	# echo "PROJECT_PORT_ID=${PROJECT_PORT_ID}" >> $ENVFILE
	#Docker sock, use to map traefik and cadvisor

	echo "DOCKER_SOCKET=${DOCKER_SOCKET}" >> $ENVFILE

	#Ports
	
	#REMOVE THIS TODO, THIS IS UNSAFE AND SHOULD BE ONLY FOR DEBUG
	# BACK_PORT=${PROJECT_PORT_ID}82
	# echo "BACK_PORT=${BACK_PORT}" >> $ENVFILE

	# if [ -z "${FRONT_PORT}" ]; then
	# 	FRONT_PORT=${PROJECT_PORT_ID}81
	# fi
	echo "FRONT_PORT=${FRONT_PORT}" >> $ENVFILE

	# if [ -z "${WEBSOCKET_PORT}" ]; then
	# 	WEBSOCKET_PORT=${PROJECT_PORT_ID}80
	# fi
	echo "WEBSOCKET_PORT=${WEBSOCKET_PORT}" >> $ENVFILE

	# #This is unused in developpement
	# if [ -z "${FRONT_HTTP_PORT}" ]; then
	# 	FRONT_HTTP_PORT=${PROJECT_PORT_ID}83
	# fi
	echo "FRONT_HTTP_PORT=${FRONT_HTTP_PORT}" >> $ENVFILE
	# if [ -z "${LOGSTASH_PORT}" ]; then
	# 	LOGSTASH_PORT=6514
	# fi
	echo "LOGSTASH_PORT=${LOGSTASH_PORT}" >> $ENVFILE
	#For Next.js
	echo "NEXT_PUBLIC_FRONT_PORT=${FRONT_PORT}" >> $ENVFILE
	echo "NEXT_PUBLIC_WEBSOCKET_PORT=${WEBSOCKET_PORT}" >> $ENVFILE

	#Postgresql
	echo "TZ=Europe/Paris" >> $ENVFILE
	
	USERNAME=$POSTGRES_USERNAME
	if [ -z "${POSTGRES_PASSWORD}" ]; then
  		# If MY_VAR is not set or is empty, assign it the value "toto"
  		PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
		POSTGRES_PASSWORD="$PASSWORD"
	else
		PASSWORD="$POSTGRES_PASSWORD"
	fi
	echo -e "\e[0;32m\n[SECRET]\tAccess to postrgesql\nUsername: ${USERNAME}\nPassword: ${PASSWORD}\n(Acccess to postgresql)\e[0m"
	echo "POSTGRES_USER=${USERNAME}" >> $ENVFILE
	echo "POSTGRES_PASSWORD=${PASSWORD}" >> $ENVFILE
	echo "PGUSER=${USERNAME}" >> $ENVFILE
	echo "POSTGRES_DB=${POSTGRES_USERNAME}" >> $ENVFILE
	
	#For postgres-exporter
	echo "DATA_SOURCE_NAME=postgresql://${USERNAME}:${PASSWORD}@db:5432/transcendence" >> $ENVFILE
	
	#DJANGO User Admin
	USERNAME=$DJANGO_USERNAME
	if [ -z "${DJANGO_PASSWORD}" ]; then
  		# If MY_VAR is not set or is empty, assign it the value "toto"
  		PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
		DJANGO_PASSWORD="$PASSWORD"
	else
		PASSWORD="$DJANGO_PASSWORD"
	fi
	echo -e "\e[0;32m\n[SECRET]\tAdministrative access to transcendence\nUsername: ${USERNAME}\nPassword: ${PASSWORD}\n(Access to https://${FQDN}/login)\e[0m"
	echo "DJANGO_SUPERUSER_USERNAME=${USERNAME}" >> $ENVFILE
	echo "DJANGO_SUPERUSER_PASSWORD=${PASSWORD}" >> $ENVFILE
	echo "DJANGO_SUPERUSER_EMAIL=${DJANGO_MAIL}" >> $ENVFILE
	echo "DJANGO_SECRET_KEY='${DJANGO_SECRET_KEY}'" >> $ENVFILE
	echo "DJANGO_SECRET_KEY_FALLBACK='${DJANGO_SECRET_KEY_FALLBACK}'" >> $ENVFILE
	#Next.js
	#TODO SETUP A LA MANO DANS LE DOCKERFILE
	echo "NEXT_PUBLIC_API_BASE_URL=https://frontend:3000" >> $ENVFILE
	#WS Server
	WSTOKEN=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
	echo "WS_TOKEN_BACKEND=${WSTOKEN}" >> $ENVFILE


	#Traefik adm midleware
	USERNAME=$ADM_USERNAME
	if [ -z "${ADM_PASSWD_UNCIPHERED}" ]; then
  		# If MY_VAR is not set or is empty, assign it the value "toto"
  		PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
		ADM_PASSWD_UNCIPHERED="$PASSWORD"
	else
		PASSWORD="$ADM_PASSWD_UNCIPHERED"
	fi
	echo "ADM_USER=${USERNAME}" >> $ENVFILE
	echo "ADM_PASSWD_UNCIPHERED=${PASSWORD}" >> $ENVFILE
	echo -e "\e[0;32m\n[SECRET]\tAdministrative access to devops midleware\nUsername: ${USERNAME}\nPassword: ${PASSWORD}\n(Access to https://${FQDN}/adm/*)\e[0m\n"
	# HTPASSWD_OUTPUT=$(htpasswd -bn ${USERNAME} "${PASSWORD}" | sed 's/\$/\$\$/g')
	# TODO API STUFF

	# Check the HOW_HTTPASSWD environment variable
	if [ "$HOW_HTTPASSWD" = "API" ]; then
	    echo "Using API to generate htpasswd"
	    HTPASSWD_OUTPUT=$(./httpasswd.sh  ${USERNAME} "${PASSWORD}")
	
	elif [ "$HOW_HTTPASSWD" = "apache2-tools" ]; then
	    echo "Using apache2-tools to generate htpasswd"
	    HTPASSWD_OUTPUT=$(htpasswd -bn ${USERNAME} "${PASSWORD}" | sed 's/\$/\$\$/g')

	else
	    echo "Error: Unsupported value for HOW_HTTPASSWD"
	    exit 1
	fi

	echo "ADM_PASSWD=${HTPASSWD_OUTPUT}" >> $ENVFILE
	echo "ACME_MAIL=${DJANGO_MAIL}" >> $ENVFILE
	#Grafana secrets
	echo "GF_SERVER_DOMAIN=${FQDN}" >> $ENVFILE
	echo "GF_SERVER_ROOT_URL=https://${FQDN}:${FRONT_PORT}/adm/grafana" >> $ENVFILE

	#Prometheus
	echo "PROMETHEUS_WEB_HOOK_DISCORD_URL=${DISCORD_WEBHOOK}" >> $ENVFILE
	TOKEN=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
	echo "METRICS_TOKEN_BACKEND=${TOKEN}" >> $ENVFILE
	echo $TOKEN > ./requirements/prometheus/token_backend

	#Elastic
	echo "ELASTIC_USERNAME=elastic" >> $ENVFILE
	PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
	echo "ELASTIC_PASSWORD=${PASSWORD}" >> $ENVFILE
	PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
	echo "ELASTIC_KIBANA_PASSWORD=${PASSWORD}" >> $ENVFILE
	PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
	echo "ELASTIC_LOGSTASH_PASSWORD=${PASSWORD}" >> $ENVFILE
	PASSWORD=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)
	echo "ELASTIC_KIBANA_SECURE_OBJECT_ENC_KEY=${PASSWORD}" >> $ENVFILE
	#Whitelist Traefik
	echo "ADM_ACL_IP=${IP_TO_WHITELIST}" >> $ENVFILE

#Source the .env file for this file and export it for the Makefile
source $ENVFILE
export $(cut -d= -f1 ./.env)

#Warning for auto cred
# echo -e "\033[33m[WARN]\e[0m\t Db password and Django admin password can be automatically generated\n\t If the .env got deleted and the passwords generated not save, the db became unusable and you need to ./init.sh fclean or freset\n\t \e[91mfclean and freset arg will delete forever all persistant data\e[0m\n\t Press ENTER to continue..."
# read -r





#Template to config file

	##Prometheus AlertManager
TEMPLATE="./init_template/alertmanager.yml.template"
DEST="./requirements/prometheus/inited_alertmanager.yml"
if [ ! -f "$TEMPLATE" ]; then
    echo "Template file not found: $TEMPLATE"
    exit 1
fi
template_content=$(cat "$TEMPLATE")
expanded_content=$(envsubst <<< "$template_content")
echo "$expanded_content" > "$DEST"
	##Postrges exporter conf file
TEMPLATE="./init_template/postgres_exporter.yml.template"
DEST="./requirements/postgres-exporter/inited_postgres_exporter.yml"
if [ ! -f "$TEMPLATE" ]; then
    echo "Template file not found: $TEMPLATE"
    exit 1
fi
template_content=$(cat "$TEMPLATE")
expanded_content=$(envsubst <<< "$template_content")
echo "$expanded_content" > "$DEST"

#Call Makefile
make $1

#Print Welcome information
if [ "$FRONT_PORT" != "443" ]; then
	PRINT_PORT=:${FRONT_PORT}
fi
echo -e "\033[0;36mTranscendence is UP, access it with \033[0mhttps://${FQDN}${PRINT_PORT}\033[0m"
echo -e "\033[0;36mGrafana is UP, access it with \033[0mhttps://${FQDN}${PRINT_PORT}/adm/grafana\033[0m"
echo -e "\033[0;36mELK is UP, access it with \033[0mhttps://${FQDN}${PRINT_PORT}/adm/kibana"
