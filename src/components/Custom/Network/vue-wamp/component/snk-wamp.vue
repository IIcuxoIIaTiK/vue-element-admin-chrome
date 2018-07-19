<template>
  <div id="snk_wamp"></div>
</template>

<script>
export default {
  name: 'snk-wamp',
  data() {
    return {
      mode: 'default',
      foo: 'bar',
      someValue: 'foobar'
    }
  },
  mounted() {
    console.log('snk-wamp, this.mode=', this.mode)
    console.log('snk-wamp, this.someValue=', this.someValue)
    this.$wamp.subscribe('some-topic2', function(args, kwArgs, details) {
      console.log('some-topic2: args=', args, ', kwArgs=', kwArgs, ', details=', details)
      // component context is available
      return this.foo
    }, {
      acknowledge: true // option needed for promise, automatically added
    }).then(function(s) {
      console.log('AutobahnJS Subscription object: ', s);
    })
  },
  watch: {
    someValue (val, old) {
      console.log('watch-someValue: val=', val, ', old=', old)
      this.$wamp.publish('some-topic', [], {val, old})
    }
  },
  wamp: {
    subscribe: {
      'some-topic' (args, kwArgs, details) {
        console.log('some-topic: args=', args, ', kwArgs=', kwArgs, ', details=', details)
        this.someValue = kwArgs.val
      },
      'another-topic': {
        acknowledge: true,
        function (args, kwArgs, details) {
          // do stuff
          console.log('another-topic: args=', args, ', kwArgs=', kwArgs, ', details=', details)
        }
      }
    },
    register: {
      'some-rpc' (args, kwArgs, details) {
        console.log('some-rpc: args=', args, ', kwArgs=', kwArgs, ', details=', details)
        return args[0] + ' I am useful!';
      },
      'another-rpc': {
        invoke: 'random',
        function (args, kwArgs, details) {
          // more stuff
          console.log('another-rpc: args=', args, ', kwArgs=', kwArgs, ', details=', details)
        }
      }
    }
  }
}
</script>