# Setup

##  logic

- local setup

```sh
brew install jupyter

# open notebook in browser
jupyter notebook ./logic/ev_charging_demand.ipynb
```

- run binary

```sh
docker build -t compiled-logic-script .
docker run --rm -it compiled-logic-script
```

## frontend 

- local setup

```sh
npm --prefix=frontend install
npm --prefix=frontend run dev
```

## backend 

- local setup
```sh
npm --prefix=server install
npm --prefix=server run db:push
npm --prefix=server run db:seed all # optional
```

```sh    
npm --prefix=server run dev
```
