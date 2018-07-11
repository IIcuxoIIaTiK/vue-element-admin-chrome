<template>
  <div class="app-container">
    <!-- <el-input placeholder="Filter keyword" v-model="filterText" style="margin-bottom:30px;"></el-input> -->

    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" :placeholder="$t('table.title')" v-model="listQuery.title">
      </el-input>
      <el-select clearable style="width: 90px" class="filter-item" v-model="listQuery.importance" :placeholder="$t('table.importance')">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>
      <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.type" :placeholder="$t('table.type')">
        <el-option v-for="item in  calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key">
        </el-option>
      </el-select>
      <el-select @change='handleFilter' style="width: 140px" class="filter-item" v-model="listQuery.sort">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('table.search')}}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
      <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">{{$t('table.export')}}</el-button>
      <el-checkbox class="filter-item" style='margin-left:15px;' @change='tableKey=tableKey+1' v-model="showReviewer">{{$t('table.reviewer')}}</el-checkbox>
    </div>

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
import { getSearchResults, fetchPv } from '@/components/admin-lite/api/3rdparty/github.js'

import waves from '@/components/admin-lite/directive/waves' // 水波纹指令
import { parseTime } from '@/components/admin-lite/utils'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj ,such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'complexTable',
  directives: {
    waves
  },
  data () {
    return {
      res: null,
      resLoading: true,
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
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
    },
    typeFilter (type) {
      return calendarTypeKeyValue[type]
    }
  },
  mounted () {
    // console.log('github-search mounted')
  },
  created () {
    // console.log('github-search created')
    this.fetchData()
  },
  methods: {
    getList () {
      this.listLoading = true
      getSearchResults(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter () {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange (val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange (val) {
      this.listQuery.page = val
      this.getList()
    },
    handleModifyStatus (row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    resetTemp () {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate () {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    /*
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    */
    handleUpdate (row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    /*
    updateData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    */
    handleDelete (row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleFetchPv (pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload () {
      this.downloadLoading = true
      import('@/components/admin-lite/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    filterNode (value, data) {
      if (!value) return true
      return data.path.indexOf(value) !== -1
    },
    fetchData () {
      this.resLoading = true
      // console.log('github-search fetchData')
      getSearchResults(this.searchQuery).then(response => {
        // console.log('github-search results', response)
        this.res = response.items
        // console.log('github-search items', this.res)
        // console.log('github-search fetchData')
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
