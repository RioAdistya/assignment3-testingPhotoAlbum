# tugas assignment 3 Testing Photo Album

## DOCUMENTATION Testing API

<p> Dokumentasi untuk Testing API photoAlbum </p>

<p> membuat integration test pada endpoint endpoint photoAlbum meggunakan library jest daan super test pada </p>

## CLONE REPOSITORY

```bash
$ git clone <remote_repo> (ex: git clone https://github.com/RioAdistya/photoAlbum.git)
```

## HOW TO SETUP

```bash
$ npm install (to install dependencies on the project stored in package.json)
# step pertama : rename .env.example to .env
# step kedua : konfigrasi file .env isi PORT dan SECRET_TOKEN
# step ketiga : konfigurasi direktori config dan sesuaikan dengan konfigurasi postgre pada device masing-masing
```

## HOW TO SETUPDATABASE

<p>Buat database postgre menggunakan ORM Sequelize</p>

```bash
create name dataase postgre dan sesuaikan nama pada database sama config kalian

config yang dipake yaitu test

$ npx sequelize db:create (to create database)
```

```bash
$ npx sequelize db:migrate (to migration table on database)
```

## HOW TO RUN

```bash
$ npm run test
```
