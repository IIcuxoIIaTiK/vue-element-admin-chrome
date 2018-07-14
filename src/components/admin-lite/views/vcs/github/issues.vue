<template>
  <div class="app-container">
    <!--
    Github SNK - Issues
    <el-alert title="issues" type="success" :closable="false">
      <router-view />
    </el-alert>
    -->
    <el-search-table-pagination
      :url="url"
      :columns="columns">
      <template slot-scope="scope" slot="rowIndex">
        {{ scope.$index }}
      </template>
    </el-search-table-pagination>
  </div>
</template>

<script>
export default {
  // name: 'GithubSearchIssues',
  mounted () {
    console.log('github-issues mounted, url=', this.url)
  },
  created () {
    console.log('github-issues created, url=', this.url)
  },
  data () {
    return {
      url: 'https://api.github.com/repos/zollero/el-search-table-pagination/branches',
      api: {
        endpoint: '',
        domain: '',
        options: '',
        protocol: ''
      },
      formOptions: {
        inline: true,
        submitBtnText: 'Search',
        forms: [
          { prop: 'name', label: 'Branch' },
          { prop: 'commit', label: 'Last Commit' }/*,
          { prop: 'sex', label: 'Sex', itemType: 'select',
            options: [
              { value: '', label: 'All' },
              { value: 0, label: 'Male' },
              { value: 1, label: 'Female' }
            ]
          }*/
        ]
      },
      columns: [
        { prop: 'name', label: 'Branch', width: 100 },
        { prop: 'commit', label: 'Last Commit', minWidth: 140, render: row => row.commit.sha },
        { prop: 'commit', label: 'Last Commit Url', minWidth: 180, render: row => row.commit.url },
        { label: 'Row Index', minWidth: 180, slotName: 'rowIndex' }
      ]
    }
  }
}
</script>

<style>
</style>
