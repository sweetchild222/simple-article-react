#!/bin/bash

tar xvzf react_dist.tar.gz
rm -rf /var/www/simple
mv react_dist /var/www/simple
rm react_dist.tar.gz
