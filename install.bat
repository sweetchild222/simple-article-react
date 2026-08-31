npm version patch
call rmdir /s /q react_dist
call del /q react_dist.tar.gz
call npm run build
call tar -czvf react_dist.tar.gz react_dist
call scp -i Lightsail.pem react_dist.tar.gz ubuntu@3.38.108.151:~/react_dist_tmp/.