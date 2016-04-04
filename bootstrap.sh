#!/bin/sh

# Add nodejs 5.x repository
curl -sL https://deb.nodesource.com/setup_5.x | bash -

# Add PostgreSQL 9.5 repository
echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Import the repository signing key
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
  sudo apt-key add -

# Update the package lists
sudo apt-get update

apt-get install -y --no-install-recommends \
	build-essential \
	postgresql \
	postgresql-contrib \
	nodejs

sudo -u postgres createuser iceboxuser
sudo -u postgres psql -c "alter user iceboxuser with password 'testForIce';"
sudo -u postgres createdb -O iceboxuser icobox "DB for icebox-service"
