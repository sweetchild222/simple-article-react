call rmdir /s /q dist_package
call del /q dist_package.tar.gz
call npm run build
call tar -czvf dist_package.tar.gz dist_package
call scp -i Lightsail.pem dist_package.tar.gz ubuntu@3.38.108.151:~/leafstory_distribute_place/.