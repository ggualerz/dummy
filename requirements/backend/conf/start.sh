#!/bin/bash

echo "Initializing Django"

until [ -d /usr/app ]
do
	sleep 2
done

cd /usr/app

until [ -f manage.py ]
do
	sleep 2
done

echo "Making DB migrations"
python manage.py makemigrations
python manage.py migrate
echo "Migrations are done"

SU_EXISTS=$(python manage.py shell -c "exec(\"from django.contrib.auth import get_user_model; print(get_user_model().objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists())\")")
if [ "$SU_EXISTS" == "True" ]; then
	echo "Super user already exists"
else
	echo "Creating Super user"
	python manage.py createsuperuser --noinput
fi

gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --certfile=/ssl/backend.crt --keyfile=/ssl/backend.key --ca-certs=/ssl/CA.crt
