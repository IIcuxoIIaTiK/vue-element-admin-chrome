<script>
import {validationMixin} from 'vuelidate'
import {required, email} from 'vuelidate/lib/validators'

export default {
  props: ['clickedNext', 'currentStep'],
  mixins: [validationMixin],
  data() {
    return {
      form: {
        username: '',
        demoEmail: '',
        message: ''
      }
    }
  },
  validations: {
    form: {
      username: {
        required
      },
      demoEmail: {
        required,
        email
      },
      message: {
        required
      }
    }
  },
  watch: {
    $v: {
      handler: function (val) {
        if(!val.$invalid) {
          this.$emit('can-continue', {value: true})
        } else {
          this.$emit('can-continue', {value: false})
        }
      },
      deep: true
    },
    clickedNext(val) {
      if(val === true) {
        this.$v.form.$touch()
      }
    }
  },
  mounted() {
    if(!this.$v.$invalid) {
      this.$emit('can-continue', {value: true})
    } else {
      this.$emit('can-continue', {value: false})
    }
  }
}
</script>