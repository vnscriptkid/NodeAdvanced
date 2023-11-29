up:
	docker compose up

up_build:
	docker compose up --build

down:
	docker compose down --remove-orphans --volumes

# log into mongo shell
mongo:
	docker exec -it blog-mongo mongosh

### basic mongosh commands
# show dbs: show databases
# use <db>: use database
# show collections: show collections
# db.<collection>.find(): show all documents in collection