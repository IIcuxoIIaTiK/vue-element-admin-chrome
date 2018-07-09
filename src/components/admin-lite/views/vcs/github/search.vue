<template>
  <div class="app-container">
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row>

      <el-table-column align="center" label='Id' width="95">
        <template slot-scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>

      <el-table-column label="Project">
        <template slot-scope="scope">
          {{scope.row.full_name}}
        </template>
      </el-table-column>

      <el-table-column label="Owner" width="110" align="center">
        <template slot-scope="scope">
          <a :href="scope.row.owner.html_url" :rel="scope.row.owner.name">
            <img :alt="scope.row.owner.$name" class="list-avatar" :src="scope.row.owner.avatar_url" />
          </a>
        </template>
      </el-table-column>

      <el-table-column label="Stargazers" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.stargazers_count}}
        </template>
      </el-table-column>

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

      <el-table-column align="center" prop="created_at" label="Display_time" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.created_at}}</span>
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<script>
import { getList } from '@/components/admin-lite/api/3rdparty/github.js'

export default {
  data () {
    return {
      list: null,
      listLoading: true
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
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.data.items
        this.listLoading = false
      })
    }
  }
}
</script>

<style>

  .list-avatar {
    border: 0px;
    max-width: 50px;
    max-height: 50px;
  }

</style>
