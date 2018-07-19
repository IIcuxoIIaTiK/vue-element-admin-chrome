<template>
  <div class="app-container">
    <h3>vue-iris-todo-mvc2</h3>
    <section class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input class="new-todo" autofocus autocomplete="off" placeholder="What needs to be done?" v-model="newTodo" @keyup.enter="addTodo">
      </header>
      <section class="main" v-show="todos.length" v-cloak>
        <input class="toggle-all" type="checkbox" v-model="allDone">
        <ul class="todo-list">
          <li v-for="todo in filteredTodos" class="todo" :key="todo.id" :class="{ completed: todo.completed, editing: todo == editedTodo }">
            <div class="view">
               <!-- v-model="todo.completed" -->
              <input class="toggle" type="checkbox" @click="completeTodo(todo)">
              <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
              <button class="destroy" @click="removeTodo(todo)"></button>
            </div>
            <input class="edit" type="text" v-model="todo.title" v-todo-focus="todo == editedTodo" @blur="doneEdit(todo)" @keyup.enter="doneEdit(todo)"
              @keyup.esc="cancelEdit(todo)">
          </li>
        </ul>
      </section>
      <footer class="footer" v-show="todos.length" v-cloak>
        <span class="todo-count">
          <strong>{{ remaining }}</strong> {{ remaining | pluralize }} left
        </span>
        <ul class="filters">
          <li>
            <a href="#/all" :class="{ selected: visibility == 'all' }">All</a>
          </li>
          <li>
            <a href="#/active" :class="{ selected: visibility == 'active' }">Active</a>
          </li>
          <li>
            <a href="#/completed" :class="{ selected: visibility == 'completed' }">Completed</a>
          </li>
        </ul>
        <button class="clear-completed" @click="removeCompleted" v-show="todos.length > remaining">
          Clear completed
        </button>
      </footer>
    </section>
    <footer class="info">
      <p>Double-click to edit a todo</p>
    </footer>
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import VueWebsocket from 'vue-websocket'

Vue.use(VueWebsocket, 'ws://localhost:3000/todos/sync')

function fetchTodos (onComplete) {
  axios.get('/todos').then(response => {
    if (response.data === null) {
      return
    }
    onComplete(response.data)
  })
}

// handle routing
function onHashChange () {
  var visibility = window.location.hash.replace(/#\/?/, '')
  if (filters[visibility]) {
    this.visibility = visibility
  } else {
    window.location.hash = ''
    this.visibility = 'all'
  }
}

window.addEventListener('hashchange', onHashChange)
onHashChange()

var todoStorage = {
  fetch: function () {
    var todos = []
    fetchTodos(function (items) {
      for (var i = 0; i < items.length; i++) {
        todos.push(items[i])
      }
    })
    return todos
  },
  save: function (todos) {
    axios.post('/todos', JSON.stringify(todos)).then(response => {
      if (!response.data.success) {
        window.alert('saving had a failure')
        return
      }
      this.$socket.emit('save', (response) => {
        console.log('response', response)
      })
    })
  }
}

// visibility filters
var filters = {
  all: function (todos) {
    return todos
  },
  active: function (todos) {
    return todos.filter(function (todo) {
      return !todo.completed
    })
  },
  completed: function (todos) {
    return todos.filter(function (todo) {
      return todo.completed
    })
  }
}

export default {
  // name: 'snk-iris-ws',
  data () {
    return {
      todos: todoStorage.fetch(),
      newTodo: '',
      editedTodo: null,
      visibility: 'all'
    }
  },
  // computed properties
  // http://vuejs.org/guide/computed.html
  computed: {
    filteredTodos: function () {
      return filters[this.visibility](this.todos)
    },
    remaining: function () {
      return filters.active(this.todos).length
    },
    allDone: {
      get: function () {
        return this.remaining === 0
      },
      set: function (value) {
        this.todos.forEach(function (todo) {
          todo.completed = value
        })
        this.notifyChange()
      }
    }
  },
  filters: {
    pluralize: function (n) {
      return n === 1 ? 'item' : 'items'
    }
  },
  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    add () {
      // Emit the server side
      this.$socket.emit('add', { a: 5, b: 3 })
    },
    get () {
      this.$socket.emit('get', { id: 12 }, (response) => {
        console.log('response', response)
      })
    },
    notifyChange: function () {
      todoStorage.save(this.todos)
    },
    addTodo: function () {
      var value = this.newTodo && this.newTodo.trim()
      if (!value) {
        return
      }
      this.todos.push({
        id: this.todos.length + 1, // just for the client-side.
        title: value,
        completed: false
      })
      this.newTodo = ''
      this.notifyChange()
    },
    completeTodo: function (todo) {
      if (todo.completed) {
        todo.completed = false
      } else {
        todo.completed = true
      }
      this.notifyChange()
    },
    removeTodo: function (todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
      this.notifyChange()
    },
    editTodo: function (todo) {
      this.beforeEditCache = todo.title
      this.editedTodo = todo
    },
    doneEdit: function (todo) {
      if (!this.editedTodo) {
        return
      }
      this.editedTodo = null
      todo.title = todo.title.trim()
      if (!todo.title) {
        this.removeTodo(todo)
      }
      this.notifyChange()
    },
    cancelEdit: function (todo) {
      this.editedTodo = null
      todo.title = this.beforeEditCache
    },
    removeCompleted: function () {
      this.todos = filters.active(this.todos)
      this.notifyChange()
    }
  },
  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://vuejs.org/guide/custom-directive.html
  directives: {
    'todo-focus': function (el, binding) {
      if (binding.value) {
        el.focus()
      }
    }
  },
  /*
  filters: {
    all: function (todos) {
      return todos
    },
    active: function (todos) {
      return todos.filter(function (todo) {
        return !todo.completed
      })
    },
    completed: function (todos) {
      return todos.filter(function (todo) {
        return todo.completed
      })
    }
  },
  */

  // we will not use the "watch" as it works with the fields like "hasChanges"
  // and callbacks to make it true but let's keep things very simple as it's just a small getting started.
  // // watch todos change for persistence
  // watch: {
  //   todos: {
  //     handler: function (todos) {
  //       if (this.hasChanges) {
  //         todoStorage.save(todos);
  //         this.hasChanges = false;
  //       }

  //     },
  //     deep: true
  //   }
  // },
  socket: {
    // Prefix for event names
    // prefix: "/counter/",
    // If you set `namespace`, it will create a new socket connection to the namespace instead of `/`
    // namespace: "/counter",
    events: {
      // Similar as this.$socket.on("changed", (msg) => { ... });
      // If you set `prefix` to `/counter/`, the event name will be `/counter/changed`
      //
      changed (msg) {
        console.log('Something changed: ', msg)
      },
      // common socket.io events
      connect () {
        console.log('Websocket connected to ', this.$socket.nsp)
      },
      disconnect () {
        console.log('Websocket disconnected from ', this.$socket.nsp)
      },
      error (err) {
        console.error('Websocket error!', err)
      },
      saved () {
        // console.log("receive: on saved");
        fetchTodos(function (items) {
          this.todos = items
        })
      }
    }
  }
}
</script>