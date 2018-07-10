<template>
  <div class="app-container">
    <el-table :data="res" v-loading.body="resLoading" element-loading-text="Loading" border fit highlight-current-row>

      <el-table-column label="Project" width="180">
        <template slot-scope="scope">
          <a :href="scope.row.html_url" :rel="scope.row.full_name">
            {{scope.row.name}}
          </a>
        </template>
      </el-table-column>

      <el-table-column label="Owner" width="120" align="center">
        <template slot-scope="scope">
          <a :href="scope.row.owner.html_url" :rel="scope.row.owner.name">
            <img :alt="scope.row.owner.name" class="list-avatar" :src="scope.row.owner.avatar_url" />
            {{scope.row.owner.name}}
          </a>
        </template>
      </el-table-column>

      <el-table-column label="Language" width="120">
        <template slot-scope="scope">
          {{scope.row.language}}
        </template>
      </el-table-column>

      <el-table-column label="Stargazers" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.stargazers_count}}
        </template>
      </el-table-column>

      <el-table-column label="Topics">
        <template slot-scope="scope">
          <span v-for="topic in scope.row.topics" class="gh-topics">
            <a :href="'https://github.com/topics/'+topic" target="_blank">{{topic}}</a> 
          </span>
        </template>
      </el-table-column>

      <!--
      <el-table-column label="Watchers" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.watchers_count}}
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="HasIssue" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.has_issues | statusFilter">{{scope.row.$has_issues}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="created_at" label="CreatedAt" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.created_at}}</span>
        </template>
      </el-table-column>
      -->

    </el-table>
  </div>
</template>

<script>
import { getSearchResults } from '@/components/admin-lite/api/3rdparty/github.js'

export default {
  data () {
    return {
      res: null,
      resLoading: true
    }
  },
  filters: {
    insightFilter (insight) {
      const insightMap = {
        starred: 'success',
        unkown: 'gray',
        recommended: 'danger'
      }
      return insightMap[insight]
    },
    suggestFilter (suggestion) {
      const suggestFilter = {
        star: 'success',
        wip: 'gray',
        unsecure: 'danger'
      }
      return suggestFilter[suggestion]
    }
  },
  mounted () {
    console.log('github-search mounted')
  },
  created () {
    console.log('github-search created')
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.resLoading = true
      console.log('github-search fetchData')
      getSearchResults(this.searchQuery).then(response => {
        console.log('github-search results', response)
        this.res = response.items
        console.log('github-search items', this.res)
        console.log('github-search fetchData')
        this.listLoading = false
      })
    }
  }
}
</script>

<style>

  .gh-topics + .gh-topics:before {
    content: ", ";
    font-size: 10px;
    font-weight: bold;
  }

  .list-avatar {
    border: 0px!important;
    width: 50px!important;
    height: 50px!important;
    clear: both;
  }
</style>
