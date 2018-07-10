<template>
  <div class="app-container">
    <el-input placeholder="Filter keyword" v-model="filterText" style="margin-bottom:30px;"></el-input>
    <el-tree class="filter-tree" 
        :data="res" 
        :props="defaultProps" 
        default-expand-all 
        :filter-node-method="filterNode" 
        ref="tree2">
    </el-tree>

  </div>
</template>

<script>
import { getTree } from '@/components/admin-lite/api/3rdparty/github'

export default {
  data () {
    return {
      res: null,
      resLoading: true,
      filterText: '',
      defaultProps: {
        children: 'children',
        size: 'size',
        label: 'path'
      }
    }
  },
  filters: {
    statusFilter (status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  mounted () {
    console.log('github-tree mounted')
  },
  created () {
    console.log('github-tree created')
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.resLoading = true
      console.log('github-tree fetchData')
      getTree(this.treeQuery).then(response => {
        this.res = response.tree
        this.resLoading = false
      })
    },
    filterNode (value, data) {
      if (!value) return true
      return data.path.indexOf(value) !== -1
    }
  },
  watch: {
    filterText (val) {
      this.$refs.tree2.filter(val)
    }
  }
}
</script>
