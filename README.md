## Demo
https://cpmclient.herokuapp.com

## Getting Started

Menginstall semua modul yang ada pada package.json

```
cd /client
npm install
cd ..
cd /server
npm install
```

## How To Use

### Terminal 1
Berfungsi sebagai server sekaligus web service yang berjalan pada localhost:4000/graphql
```
cd /server
npm start
```

### Terminal 2
Berfungsi sebagai client yang berjalan pada localhost:3000
```
cd /client
npm start
```

## System Structure
Pengguna mengakses aplikasi sebagai sisi client yang dikembangkan menggunakan ReactJS dan GraphQL. Client melakukan pertukaran dan mutasi data kepada server yang dikembangkan menggunakan NodeJS dan GraphQL. Server mengakses data kepada database yang dikembangkan menggunakan MongoDB Cloud. GraphQL pada sisi client dan server digunakan sebagai web service untuk menjembatani antara client dengan database.
<p align="center"><img src="system.png"></p>

## Data Structure
<p align="center"><img src="data.png"></p>