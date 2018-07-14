# Rosco Pecoltran

default: help

all: zoekt-refresh

print-%: ; @echo $*=$($*)

run-dev-hot-reload:
	@go run -race service/cmd/fake-api/*.go

run-dev-fakeapi:
	@go run -race service/cmd/fake-api/*.go

run-dev-server:
	@go run -race service/cmd/snk-server/*.go

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
	@zoekt-index -file_limit $(ZOEKT_MAX_FILESIZE) -index $(ZOEKT_IDX_DIR) -ignore_dirs $(ZOEKT_EXCLUDE_DIRS) ./src
	@zoekt-index -file_limit $(ZOEKT_MAX_FILESIZE) -index $(ZOEKT_IDX_DIR) -ignore_dirs $(ZOEKT_EXCLUDE_DIRS) ./.staging

zoekt-web: ## start zoekt's UI webservice to search source code
	@zoekt-webserver -listen $(ZOEKT_UI_ADDR)

zoekt-api: ## start zoekt's UI webservice to search source code
	@zoekt-webserver -index $(ZOEKT_IDX_DIR) -listen $(ZOEKT_API_ADDR)

zs-%: ## search request in all source code
	@zoekt -index_dir $(ZOEKT_IDX_DIR) '"$*"'

zsc-%: ## search request in core sources
	@zoekt -index_dir $(ZOEKT_IDX_DIR) '"$*"'

zss-%: ## search request in all staging references source code
	@zoekt -index_dir $(ZOEKT_IDX_DIR) '"$*"'

help: ## this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {sub("\\\\n",sprintf("\n%22c"," "), $$2);printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: zoekt-refresh zoekt-clean zoekt-index help print-% zs-% zss-% zsc-% run-dev-server run-dev-hot-reload run-dev-fakeapi
