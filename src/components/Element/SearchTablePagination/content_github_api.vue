<template>
  <el-search-table-pagination
    :url="endpoint+uri+options"
    :columns="columns">
    <template slot-scope="scope" slot="rowIndex">
      {{ scope.$index }}
    </template>
  </el-search-table-pagination>
</template>

<script>
  import '@element-ui/lib/theme-chalk/index.css'

  export default {
    data() {
      return {
        endpoint: 'https://api.github.com/repos',
        uri: 'repos/zollero/el-search-table-pagination',
        options: 'branches',
        formOptions: {
          inline: true,
          submitBtnText: 'Search',
          forms: [
            { prop: 'name', label: 'Branch' },
            { prop: 'commit', label: 'Last Commit' },
            { prop: 'commit', label: 'Last Commit Url', itemType: 'select',
              options: [
                { value: '', label: 'All' },
                { value: 0, label: 'Male' },
                { value: 1, label: 'Female' }
              ]
            }
          ]
        },
        columns: [
          { prop: 'name', label: 'Branch', width: 100 },
          { prop: 'commit', label: 'Last Commit', minWidth: 140, render: row => row.commit.sha },
          { prop: 'commit', label: 'Last Commit Url', minWidth: 180, render: row => row.commit.url },
          { label: 'Row Index', minWidth: 180, slotName: "rowIndex" }
        ]
      }
    }
  }
</script>

<style>
</style>
