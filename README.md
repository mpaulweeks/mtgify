# mtg-toolbox

[![CircleCI](https://circleci.com/gh/mpaulweeks/mtg-toolbox/tree/master.svg?style=svg)](https://circleci.com/gh/mpaulweeks/mtg-toolbox/tree/master)

assorted tools for MTG apps

# todo

- remove dist from git, make build part of cronjob

# nginx

```
server {
  listen 80;
  server_name autocard.mpaulweeks.com;

  location /dist/ {
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/dist/;
  }
  location /json/ {
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/json/;
  }

  location /example/ {
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/example/;
  }
  location /test/ {
    autoindex on;
    alias /home/ec2-user/mtg-toolbox/test/;
  }
}
```
