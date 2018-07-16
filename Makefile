# Rosco Pecoltran

default: help

all: zoekt-refresh

print-%: ; @echo $*=$($*)

run-dev-hot-reload:
	@go run -race service/cmd/fake-api/*.go

run-dev-fakeapi:
	@go run -race service/cmd/fake-api/*.go

run-dev-server:
	@go run -race service/cmd/snk-server/*.go --config-dir=./shared/conf/fake-api --resource-dir=./shared/testdata/fake-api

.PHONY: run build install deps core-deps local-deps nodejs-deps assets bindata staticfiles go-bindata

backend-run: bindata
	@go run -race ./backend/snk-goes/*.go \
		--config-dir=./shared/conf \
		--config-file=config.yaml \
		--resource-dir=./shared/data

backend-build: assets
	@go build -o ./bin/snk-goes ./backend/snk-goes/*.go

backend-build-run:
	@./bin/snk-goes \
		--config-dir=./shared/conf \
		--config-file=config.yaml \
		--resource-dir=./shared/data

install:
	@go install backend/snk-goes

assets: gz-bindata # go-bindata

gz-bindata:
	@bindata -ignore=\\.DS_Store -pkg main -o ./backend/snk-goes/gz-bindata.go ./shared/dist/web/...

go-bindata:
	@go-bindata -ignore=\\.DS_Store -pkg main -o ./backend/snk-goes/go-bindata.go ./shared/dist/web/...

deps: local-deps

nodejs-deps:
	@brew install yarn

core-deps:
	@go get -u github.com/kataras/bindata/cmd/bindata
	@go get -u github.com/bouk/staticfiles
	@go get -u github.com/jteeuwen/go-bindata/...
	@go get -u github.com/mitchellh/gox
	@go get -u github.com/Masterminds/glide

local-deps:
	@glide install --strip-vendor

ZOEKT_IDX_DIR 		:= $(CURDIR)/.meta/search/zoekt
ZOEKT_EXCLUDE_DIRS 	:= $(CURDIR)/.meta,.git,.hg,.svn,/node_modules/,node_modules,/build/,bin,temp,tmp,_build*,_log* #,.staging
ZOEKT_MAX_FILESIZE 	:= 32768
ZOEKT_UI_ADDR 		:= :6070
ZOEKT_API_ADDR 		:= :2379

zoekt-clean: ## remove all source code trigram indices for this repo
	@rm -fr $(ZOEKT_IDX_DIR)/*

zoekt-refresh: zoekt-clean zoekt-index ## refresh zoekt's all code indices/shards

# todo: need to create a function to loop over indexable dirs by passing them as a variable
zoekt-index: ## index all available source code recursively from current dir (in ./)
	@zoekt-index -file_limit $(ZOEKT_MAX_FILESIZE) -index $(ZOEKT_IDX_DIR) -ignore_dirs $(ZOEKT_EXCLUDE_DIRS) .

zoekt-web: ## start zoekt's UI webservice to search source code
	@zoekt-webserver -listen $(ZOEKT_UI_ADDR)

zoekt-api: ## start zoekt's UI webservice to search source code
	@zoekt-webserver -index $(ZOEKT_IDX_DIR) -listen $(ZOEKT_API_ADDR)

help: ## this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {sub("\\\\n",sprintf("\n%22c"," "), $$2);printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: zoekt-refresh zoekt-clean zoekt-index help print-% zs-% zss-% zsc-% run-dev-server run-dev-hot-reload run-dev-fakeapi
