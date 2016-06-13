#!/bin/sh

# Add nodejs 5.x repository
curl -sL https://deb.nodesource.com/setup_5.x | bash -

# Update the package lists
sudo apt-get update

apt-get install -y --no-install-recommends \
	build-essential \
	nodejs
