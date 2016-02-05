#!/bin/sh

curl -sL https://deb.nodesource.com/setup_5.x | bash -
apt-get install -y --no-install-recommends \
	build-essential \
	postgresql \
	postgresql-contrib \
	nodejs

sudo -u postgres createuser iceboxuser
sudo -u postgres psql -c "alter user iceboxuser with password 'testForIce';"
sudo -u postgres createdb -O iceboxuser icobox "DB for icebox-service"
