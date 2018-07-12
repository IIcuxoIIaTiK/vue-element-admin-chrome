import Vue from 'vue'
import ElSearchTablePagination from 'el-search-table-pagination'

/*
    Ref: https://github.com/zollero/el-search-table-pagination
*/

// or set a custom HTTP tool
import axios from 'axios'

// Default use axios as HTTP tool
// Vue.use(ElSearchTablePagination)

Vue.use(ElSearchTablePagination, {
    axios
})
