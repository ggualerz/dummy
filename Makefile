# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: thepaqui <thepaqui@student.42nice.fr>      +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/05/05 17:13:04 by thepaqui          #+#    #+#              #
#    Updated: 2024/05/05 18:12:21 by thepaqui         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

include ./.env
export

# Define the temporary Makefile path
.PHONY: all f clean fclean re fre reset freset

# TODO: Need to launch this in rootless mode :(

all: #TODO TOKEN MESKOUILLES voir greg
	@./requirements/CAandCertGeneration.sh
	@echo "Building the services and starting them in background"
	@docker compose build && docker compose  up -d

f:
	@./requirements/CAandCertGeneration.sh
	@echo "Building the services and starting them in foreground"
	@docker compose build && docker compose up
	
clean:
	@echo "Stopping services and their network, keeping volumes and images"
	@docker compose down

# TODO: Make this only remove images associated with ${PROJECT_NAME}
fclean:
	@./requirements/CAandCertDeletion.sh
	@echo "Stopping services and their network, deleting volumes and images"
	@docker compose down -v
	@docker system prune --all
	@docker volume prune -f
nothing:
	@echo "Do nothing"
re: clean all

fre: clean f

reset: fclean all

freset: fclean f
