# Client-side React App

## Env variables

All of them are listed in `.env.sample`. To start local app you have to define them in `.env.local`.

## Docker

### Build

```sh
docker build --build-arg REVISION=local -t ghcr.io/boonya/listok-client:local -f ./client/Dockerfile .
```

### Run

```sh
docker run --rm -p 31234:31234 -e API_URL=http://localhost:31235 ghcr.io/boonya/listok-client:local
```

Open [http://localhost:31234/]

## Misc

- [How to run a vite project over HTTPS and accessible by local network](https://laracasts.com/discuss/channels/vite/how-to-run-a-vite-project-over-https-and-accessible-by-local-network)
