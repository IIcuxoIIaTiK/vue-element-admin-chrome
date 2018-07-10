<template>
  <div class="app-container">
    <el-input placeholder="Filter keyword" v-model="filterText" style="margin-bottom:30px;"></el-input>
    <el-tree class="filter-tree" 
        :data="data2" 
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
      filterText: ''
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
        this.res = response.data.tree
        this.resLoading = false
      })
    },
    filterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    }
  },
  watch: {
    filterText (val) {
      this.$refs.tree2.filter(val)
    }
  }

  /*
  data () {
    return {
      filterText: '',
      data2: [{
        id: 1,
        label: 'Level one 1',
        children: [{
          id: 4,
          label: 'Level two 1-1',
          children: [{
            id: 9,
            label: 'Level three 1-1-1'
          }, {
            id: 10,
            label: 'Level three 1-1-2'
          }]
        }]
      }, {
        id: 2,
        label: 'Level one 2',
        children: [{
          id: 5,
          label: 'Level two 2-1'
        }, {
          id: 6,
          label: 'Level two 2-2'
        }]
      }, {
        id: 3,
        label: 'Level one 3',
        children: [{
          id: 7,
          label: 'Level two 3-1'
        }, {
          id: 8,
          label: 'Level two 3-2'
        }]
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  }
  */
}
</script>
