# Running on a server

- make sure apache/nginx is running
- make a rule for the directory in nginx/apache
- make a rule for the build folder in systemd so it starts as a service
- chmod +x on index.js in build/
- copy node shabang onto index.js in build/
- create a .env file with all required variables
- profit

# Setup
- ensure mariadb, node, and, npm are installed
- create a mariadb user with read and write on a new database
- run npm install in the project directory
- create a .env file with the following:
```sh
DB_HOST=<maria db IP>
DB_USER=<maria db user name>
DB_PASSWORD=<mariadb users password>>
DB_NAME=<mariadb database name>
DB_CHARSET=utf8mb4
DB_PORT=<mariadb port (probably 3306)>

REVIEW_DOC_API_KEY=<an API key for the single user>

REVIEW_DOC_BACKUP_DIR=<absolute path to a backup directory for database snapshots>

REVIEW_DOC_IGDB_CLIENT_ID=<igdb client id>
REVIEW_DOC_IGDB_SECRET_ID=<igdb secret id>

REVIEW_DOC_TMDB_READ_ACCESS_TOKEN=<tmdb access token>

```
- run ``npm install``
- run ``npm run dev`` or ``npm run build``
- profit

# Tech stack
- mariadb
- node
- svelte kit 5
- tailwind
- skeleton ui 3