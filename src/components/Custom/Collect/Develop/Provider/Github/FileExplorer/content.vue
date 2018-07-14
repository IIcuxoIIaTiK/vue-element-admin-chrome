<template>
  <div class="row">
    <div class="col-md-12">
      <table class="table">
        <caption>{{ path }}</caption>
        <thead>
          <tr>
            <th>Name</th>
            <th class="text-right">
              <button class="btn btn-default btn-xs" @click="goBack()" v-if="path !== '/'">
              Go Back
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file in sortedFiles">
            <td>
              <div class="file" v-if="file.type === 'file'">
                <i class="fa fa-file-o"></i>
                {{ file.name }}
              </div>
              <div class="directory" v-if="file.type === 'dir'">
                <i class="fa fa-folder-o"></i>
                <a @click="changePath(file.path)">{{ file.name }}</a>
              </div>
            </td>
            <td class="text-right">
              <a href="{{ file.download_url }}" download v-if="file.type === 'file'">
                  <i class="fa fa-cloud-download"></i>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// https://github.com/scotch-io/vuejs-github-explorer/blob/master/src/js/app.js

export default {
  data() {
    return {
      fullRepoName: '',
      username: '',
      repo: '',
      path: '/',
      files: []
    }
  },
  props: {
    username: {
      type: String,
      required: true
    },
    repo: {
      type: String,
      required: true
    }
  },
  computed: {
    fullRepoUrl: function () {
      return this.username + '/' + this.repo
    },
    sortedFiles: function () {
      return this.files.slice(0).sort(function(a, b) {
        if (a.type !== b.type) {
          if (a.type === 'dir') {
            return -1
          } else {
            return 1
          }
        } else {
          if (a.name < b.name) {
            return -1
          } else {
            return 1
          }
        }
      })
    }
  },
  methods: {
    changeRepo: function() {
      var splitData = this.fullRepoName.split('/')
      this.username = splitData[0]
      this.repo = splitData[1]

      console.group("Vue Data")
      console.log("fullRepoName:", this.fullRepoName)
      console.log("username:", this.username)
      console.log("repo:", this.repo)
      console.groupEnd("Vue Data")
    },
    getFiles: function () {
      this.$http.get('https://api.github.com/repos/' + this.fullRepoUrl + '/contents' + this.path,
        function(data) {
            this.files = data
        }
      )
    },
    changePath: function (path) {
      this.path = '/' + pat
      this.getFiles()
    },
    goBack: function() {
      this.path = this.path.split('/').slice(0, -1).join('/')
      if (this.path === '') this.path = '/'
      this.getFiles()
    }
  },
  watch: {
    repo: function(newVal, oldVal) {
      this.path = '/'
      this.getFiles()
    }
  },
  created: function() {
    if (this.username && this.repo) this.getFiles()
  }
}
</script>
