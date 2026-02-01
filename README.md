# listok Project

## Env variables

All of them are listed in `.env.sample`. To start local app you have to define them in `.env.local`.

```sh
cp .env.sample .env.local`
```

## Docker

### Build

```sh
REVISION=$(date '+%Y.%m.%d-%H.%M.%S')
docker build --build-arg REVISION=${REVISION} -t boonya/listok:${REVISION} -t boonya/listok:latest .
```

### Run

```sh
docker run --rm -p 3000:3000 --env-file=.env.docker.local boonya/listok:latest
```
