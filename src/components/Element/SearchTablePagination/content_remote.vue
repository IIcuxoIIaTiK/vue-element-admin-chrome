<template>
  <el-search-table-pagination
    url="example.xxx.com/list"
    :columns="columns"
    :formOptions="formOptions">
  </el-search-table-pagination>
</template>

<script>
  export default {
    data() {
      return {
        formOptions: {
          inline: true,
          submitBtnText: 'Search',
          forms: [
            { prop: 'name', label: 'Name' },
            { prop: 'mobile', label: 'Mobile' },
            { prop: 'sex', label: 'Sex', itemType: 'select',
              options: [
                { value: '', label: 'All' },
                { value: 0, label: 'Male' },
                { value: 1, label: 'Female' }
              ]
            }
          ]
        },
        columns: [
          { prop: 'name', label: 'Name', width: 140 },
          { prop: 'mobile', label: 'Mobile', minWidth: 180 },
          { prop: 'sex', label: 'Sex', width: 80,
            render: row => {
              const { sex } = row
              return sex === 0 ? 'Male' : sex === 1 ? 'Female' : 'Unknow'
            }
          }
        ]
      }
    }
  }
</script>