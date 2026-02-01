# Server-side Application

## Env variables

All of them are listed in `.env.sample`. To start local app you have to define them in `.env.local`.

## Docker

### Build

```sh
docker build --build-arg REVISION=local ghcr.io/boonya/listok-server:local -f ./server/Dockerfile .
```

### Run

```sh
docker run --rm -p 31235:31235 --env-file=server/.env.docker.local ghcr.io/boonya/listok-server:local
```

Open [http://localhost:31235/]
