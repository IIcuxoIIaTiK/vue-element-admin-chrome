'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_API: '"https://easy-mock.com/mock/5950a2419adc231f356a6636/vue-admin"',
})

// https://easy-mock.com/mock/5950a2419adc231f356a6636/vue-admin/table/list
// https://easy-mock.com/mock/5950a2419adc231f356a6636/vue-admin/table/list

// table
// --- GET
// https://easy-mock.com/mock/5950a2419adc231f356a6636/vue-admin/table/list

// user
// --- GET
// https://easy-mock.com/mock/5950a2419adc231f356a6636/vue-admin/user/info
// --- POST
// https://easy-mock.com/mock/5950a2419adc231f356a6636/vue-admin/user/logout
// https://easy-mock.com/mock/5950a2419adc231f356a6636/vue-admin/
// https://easy-mock.com/mock/5950a2419adc231f356a6636/vue-admin/