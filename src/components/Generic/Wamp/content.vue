<template>
    <div></div>
</template>
<script>
export default {
    data() {
        return {
            someValue: 'foobar'
        };
    },
    watch: {
        someValue(val, old) {
            this.$wamp.publish('some-topic', [], {val, old});
        }
    },
    wamp: {
        subscribe: {
            'some-topic'(args, kwArgs, details) {
                this.someValue = kwArgs.val;
            },
            'another-topic': {
                acknowledge: true,
                function(args, kwArgs, details) {
                    // do stuff
                }
            }
        },
        register: {
            'some-rpc'(args, kwArgs, details) {
                return args[0] + ' I am useful!';
            },
            'another-rpc': {
                invoke: 'random',
                function(args, kwArgs, details) {
                    // more stuff
                }
            }
        }
    }
}
</script>
