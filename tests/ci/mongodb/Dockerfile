FROM mongo:4.4

COPY ./scripts/create_users.js ./scripts/import.sh ./docker-entrypoint-initdb.d/
COPY ./data ./import/
