# FE installation

```
npm install
```

run tests once
```
npm run test
```

run tests continously
```
npm run ci
```

auto-reloading dev server
```
npm run watch
```

create dist files
```
npm run build
```

# nginx config

```
server {
  server_name magicautocard.info;

  location / {
    include /etc/nginx/cors.conf;
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/docs/;
  }
  location /dist/ {
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/dist/;
  }
  location /json/ {
    include /etc/nginx/cors_public.conf;
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/json/;
  }
  location /test/ {
    include /etc/nginx/cors.conf;
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/test/;
  }

  listen 443 ssl; # managed by Certbot
  ssl_certificate /etc/letsencrypt/live/magicautocard.info/fullchain.pem; # managed by Certbot
  ssl_certificate_key /etc/letsencrypt/live/magicautocard.info/privkey.pem; # managed by Certbot
  include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```
