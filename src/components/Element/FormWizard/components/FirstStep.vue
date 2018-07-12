<template>
  <el-form :model="model":rules="rules" ref="form">
    <el-form-item label="First name" prop="firstName">
      <el-input v-model="model.firstName" placeholder="First name"></el-input>
    </el-form-item>
    <el-form-item label="Last Name" prop="lastName">
      <el-input v-model="model.lastName" placeholder="Last name"></el-input>
    </el-form-item>
    <el-form-item label="Email" prop="email">
      <el-input v-model="model.email" placeholder="Email"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data () {
    return {
      model: {
        firstName: '',
        lastName: '',
        email: ''
      },
      rules: {
        firstName: [
          {
            required: true,
            message: 'First name is required',
            trigger: 'blur'
          }
        ],
        lastName: [
          {
            required: true,
            message: 'Last name is required',
            trigger: 'blur'
          }],
           email: [{
            required: true,
            message: 'Email is required',
            trigger: 'blur'
          },
          {
            type: 'email',
            message: 'Invalid email',
            trigger: 'change'
          }
        ],
      }
    }
  },
  methods: {
    validate () {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate((valid) => {
          this.$emit('on-validate', valid, this.model)
          resolve(valid)
        });
      })
    }
  }
}
</script>

<style>
</style>
