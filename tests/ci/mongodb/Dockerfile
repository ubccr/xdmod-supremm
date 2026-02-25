FROM mongo:8

COPY ./scripts/create_users.js ./scripts/import.sh ./docker-entrypoint-initdb.d/
COPY ./data ./import/
