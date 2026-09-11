#!/bin/bash

tar xvzf dist_package.tar.gz
rm -rf /var/www/simple
mv dist_package /var/www/simple
rm dist_package.tar.gz
