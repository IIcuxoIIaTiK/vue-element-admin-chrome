# NOTES

## Goals
1. **use vue-admin-element as a sidepanel to unify/integrate some useful features for github/gitlab/bitbucket browsing:**
  - examples:
    - add a dynamic/searchable list with package dependency insights
        - ref: https://github.com/BrainMaestro/packagehub
    - add a tree of all files in the repository
        - ref: https://github.com/buunguyen/octotree 
    - add tabs for golang projects with godoc related informations
        - ref: https://gotools.org/github.com/joeshaw/envdecode
    - add tooltip/hovercards effects on github links
        - ref: https://github.com/Justineo/github-hovercard
    - more references available
        - ref: https://github.com/stefanbuck/awesome-browser-extensions-for-github
2. **Create different routes per domain**
  - Ability to have a set of routes for github. gitlab and bitbucket. (maybe others websites too...)
3. **Real-time update of tables if some events occured on the backend side**
  - Implement a websocket client
  - Develop a backend in golang with some bots for indexing or harvesting additional insights