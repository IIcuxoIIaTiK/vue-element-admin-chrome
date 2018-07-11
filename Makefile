print-%: ; @echo $*=$($*)

ZOEKT_IDX_ALL 		:= $(CURDIR)/.meta/search/zoekt
ZOEKT_IDX_CORE 		:= $(CURDIR)/.meta/search/zoekt/core
ZOEKT_IDX_STAGING 	:= $(CURDIR)/.meta/search/staging

zoekt-idx: zoekt-idx-refresh ## index all source code available in this repo

zoekt-web: ## start zoekt's UI webservice to search source code
	@zoekt-webserver -listen :6070 

zoekt-api: ## start zoekt's UI webservice to search source code
	@zoekt-webserver -index  -listen :6070

zoekt-clean: ## remove all source code trigram indices for this repo
	@rm -fr $(CURDIR)/.meta/search/zoekt/*

zoekt-idx-refresh: zoekt-clean zoekt-idx-all zoekt-idx-src zoekt-idx-staging ## refresh zoekt's all code indices/shards

zoekt-idx-all: ## index all available source code recursively from current dir (in ./)
	@zoekt-index -file_limit 65536 -index $(CURDIR)/.meta/search/zoekt .

zoekt-idx-core: ## index project source code only (in ./src folder)
	@zoekt-index -file_limit 65536 -index $(CURDIR)/.meta/search/zoekt/src ./core

zoekt-idx-staging: ## index source code for staging references (in ./.staging folder)
	@zoekt-index -file_limit 65536 -index $(CURDIR)/.meta/search/zoekt/staging .staging

zs-%: ## search request in all source code 
	@zoekt -index_dir $(CURDIR)/.meta/search/zoekt '"$*"'

zsc-%: ## search request in core sources
	@zoekt -index_dir $(CURDIR)/.meta/search/zoekt/core '"$*"'

zss-%: ## search request in all staging references source code 
	@zoekt -index_dir $(CURDIR)/.meta/search/zoekt/staging '"$*"'

help: ## this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {sub("\\\\n",sprintf("\n%22c"," "), $$2);printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: zoekt-idx-refresh zoekt-clean zoekt-idx-all zoekt-idx-src zoekt-idx-staging help print-% zs-% zss-% zsc-%
