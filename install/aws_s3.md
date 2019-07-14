# Permissions

Documenting how to setup this project in aws

## bucket policy

```json
{
    "Version": "2012-10-17",
    "Id": "PublicBucketPolicy",
    "Statement": [
        {
            "Sid": "Stmt1482880670019",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::mtgify.org/*"
        }
    ]
}
```

## cors

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <MaxAgeSeconds>1800</MaxAgeSeconds>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```
