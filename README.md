# yonsen

A transaction making tool for NEM2 catapult to confirm 4,000 tx/s in private network.

## Articles

プライベートチェーンのカタパルトで秒間4000トランザクションを目指してみる
https://qiita.com/planethouki/items/9733aa83096a988ee57a

カタパルトで秒間4000内部トランザクションを目指してみる
https://qiita.com/planethouki/items/eb19ed496aa8b6d5533a

Myth or Fact? 4,000 transactions per second on the private Catapult blockchain
https://nemjapan.jp/4000-transactions-per-second-on-the-private-catapult-blockchain/

## Environment

- ubuntu 18.04 LTS
- git 2.17.1
- docker 18.06.1
- docker-compose 1.22.0
- nodejs v10.11

## How to Use

### start tech-bureau/catapult-service-bootstrap

```
git clone https://github.com/tech-bureau/catapult-service-bootstrap
cd catapult-service-bootstrap
git checkout 77e6cf38a7845194aa2ce72f4ed4d87e5ab791e3
docker-compose -f docker-compose-with-explorer.yml up -d
```

### clone this repository

```
git clone https://github.com/jontey/yonsen.git
cd yonsen
npm install
```

### create `config.json` from `addresses.yaml`.


```
cat ../build/generated-addresses/addresses.yaml
vi nemesiskeys.json
```

extract some of `nemesis_addresses.private` and place into `config.json`.

### send instant transaction

1 transfer transaction

```
node test.js
```

500 transfer transaction

```
node test.js 500
```

### prepare and send huge amount of transactions

Send transfer transaction format
```
node writetx.js [transactions per process] [number of processes to spawn]
node sendtx.js [tps] [number of processes to spawn]
```

8 * 320,000 transfer transactions

```
node writetx.js 320000 8
node sendtx.js 1000 8
```

3,000 aggregate complete transactions within 1,000 inner transactions

```
npm run createag
npm run sendag
```

### count number of transactions

```
npm run view
```
