## Rolling Video Server

## Requiredment

| dependency | least version |
| :--------- | :------------ |
| npm        | 8.19.4        |
| node       | 16.20.2       |
| pm2        |               |
| ffmpeg     |               |

## How to build

1. clone project

2. make .env file on root

```
NODE_ENV=/* ... */
MONGODB_URL=/* ... */
AWS_ACCESS_KEY_ID=/* ... */
AWS_SECRET_ACCESS_KEY=/* ... */
AWS_REGION=/* ... */
AWS_S3_BUCKET_NAME=/* ... */
```

3. install prerequirements

> TODO : this isn't work now..

```
./script/setup.sh
```

4. run server

```
./script/build.sh
```

build.sh do below jobs

1. install dependencies from package.json
2. do npm run build
3. reload pm2 through ecosystem.json
