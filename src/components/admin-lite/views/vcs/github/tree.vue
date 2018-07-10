<template>
  <div class="app-container">
    <el-input placeholder="Filter keyword" v-model="filterText" style="margin-bottom:30px;"></el-input>
    <el-tree class="filter-tree" 
        :data="res" 
        :props="defaultProps" 
        :filter-node-method="filterNode" 
        v-loading.body="resLoading" 
        ref="tree2">
    </el-tree>
  </div>
</template>

<script>
import { getTree } from '@/components/admin-lite/api/3rdparty/github'
var _ = require('lodash/core')

export default {
  data () {
    return {
      res: null,
      resLoading: true,
      filterText: '',
      defaultProps: {
        children: 'children',
        size: 'size',
        label: 'path',
        type: 'type',
        url: 'url'
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
    // console.log('github-tree mounted')
  },
  created () {
    // console.log('github-tree created')
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.resLoading = true
      // console.log('github-tree fetchData')
      getTree(this.treeQuery).then(response => {
        var res
        this.arrangeIntoTree(response.tree, function (tree) {
          // console.log('tree: ', tree)
          res = _.sortBy(tree, ['type'], ['asc'])
        })
        // console.log('res: ', res)
        this.res = res
        // console.log('this.res: ', this.res)
        this.resLoading = false
      })
    },
    filterNode (value, data) {
      if (!value) return true
      return data.path.indexOf(value) !== -1
    },
    arrangeIntoTree (entries, cb) {
      var tree = []
      _.each(entries, function (e) {
        var pathParts = e.path.split('/')
        pathParts.shift() // Remove first blank element from the parts array.
        var currentLevel = tree // initialize currentLevel to root
        _.each(pathParts, function (part) {
          // check to see if the path already exists.
          var existingPath = _.find(currentLevel, {path: part})
          if (existingPath) {
            // The path to this item was already in the tree, so don't add it again.
            // Set the current level to this path's children
            currentLevel = existingPath.children
          } else {
            // humanize ?!
            var size = e.size
            if (e.size === undefined) {
              size = 0
            }
            var newPart = {
              path: part,
              children: [],
              type: e.type,
              size: size,
              url: e.url
            }
            currentLevel.push(newPart)
            currentLevel = newPart.children
          }
        })
      })
      cb(tree)
    }
  },
  watch: {
    filterText (val) {
      this.$refs.tree2.filter(val)
    }
  }
}
</script>
