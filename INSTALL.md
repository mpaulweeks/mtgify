# FE installation and development

```
npm install
```

run tests once
```
npm run test
```

run tests continuously
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

# s3 and CloudFront setup

- https://medium.com/@willmorgan/moving-a-static-website-to-aws-s3-cloudfront-with-https-1fdd95563106
- https://www.boxuk.com/insight/tech-posts/enabling-cross-domain-access-cloudfront

# Deploying

Run `bash/cronjob.sh` at regular intervals on a server

- If the cronjob detects new changes from git, it will run `bash/rebuild.sh` which pushes new code and html to s3
- If the cronjob detects new changes from mtgjson, it will update the card info json and push it to s3
