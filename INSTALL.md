# nginx config

```
server {
  listen 80;
  server_name autocard.mpaulweeks.com;

  location / {
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/docs/;
  }
  location /dist/ {
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/dist/;
  }
  location /json/ {
    include /etc/nginx/cors.conf;
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/json/;
  }
  location /test/ {
    include /etc/nginx/cors.conf;
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/test/;
  }
}
```
