<template>
  <div id="form-wizard">
    <pre v-html="prettyJSON"></pre>
    <form-wizard @on-complete="onComplete"
    ref="wizard" 
    :start-index.sync="activeTabIndex"
    shape="circle" color="#20a0ff" error-color="#ff4949">
      <tab-content title="Personal details" icon="ti-user"
       :before-change="() => validate('firstStep')">
        <first-step ref="firstStep" @on-validate="onStepValidate"></first-step>
        <el-button @click="forceClearError">Try to clear the error</el-button>
      </tab-content>
      <tab-content title="Additional Info" icon="ti-settings"
      :before-change="() => validate('secondStep')">
        <second-step ref="secondStep" @on-validate="onStepValidate"></second-step>
      </tab-content>
      <tab-content title="Last step" icon="ti-check">
        Your data
       <pre v-html="prettyJSON"></pre>
      </tab-content>
    </form-wizard>
  </div>
</template>

<script>
import FirstStep from "./components/FirstStep.vue";
import SecondStep from "./components/SecondStep.vue";
import prettyJSON from "@components/admin-lite/utils/prettyJson.js";

export default {
  name: "app",
  components: {
    FirstStep,
    SecondStep
  },
  data () {
    return {
      finalModel: {},
      activeTabIndex: 0
    };
  },
  computed: {
    prettyJSON () {
      return prettyJSON(this.finalModel)
    }
  },
  methods: {
    onComplete () {
      alert("Yay. Done!")
    },
    forceClearError () {
      this.$refs.wizard.tabs[this.activeTabIndex].validationError = null
    },
    validate (ref) {
      return this.$refs[ref].validate();
    },
    onStepValidate (validated, model) {
      if (validated) {
        this.finalModel = { ...this.finalModel, ...model }
      }
    }
  }
};
</script>

<style>

#form-wizard {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

body {
  font-family: Menlo, Monaco, "Courier New", monospace;
  font-weight: normal;
  font-size: 14px;
  line-height: 16px;
  margin: 0;
}

pre {
  overflow: auto;
}
pre .string {
  color: #885800;
}
pre .number {
  color: blue;
}
pre .boolean {
  color: magenta;
}
pre .null {
  color: red;
}
pre .key {
  color: green;
}

.panel {
  margin-bottom: 20px;
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  border-color: #ddd;
}

.panel-heading {
  color: #333;
  background-color: #f5f5f5;
  border-color: #ddd;

  padding: 10px 15px;
  border-bottom: 1px solid transparent;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

.panel-body {
  padding: 15px;
}
</style>
