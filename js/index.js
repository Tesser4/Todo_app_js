
const model = (() => {
  const jsonServer = 'http://localhost:3000/todos/'
  let localState

  return {
    async getTasks() {
      return fetch(jsonServer)
    },
    getLocalTasks() {
      return localState
    },
    setLocalTasks(tasks) {
      localState = tasks
    },
    async postTask(task) {
      return await fetch(jsonServer, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })
    },
    async deleteTask(id) {
      return await fetch(jsonServer + id, {
        method: 'DELETE',
      })
    },
    async updateTask(task) {
      const { id } = task
      return await fetch(jsonServer + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })
    }
  }
})()

const view = (() => {
  const taskList = document.querySelector('#task-list')
  const inputField = document.querySelector('#task-input')
  const errorDiv = document.querySelector('#error-div')
  const errorMsg = document.querySelector('#error-msg')

  const createListItem = ({ title, checked = false }) => {
    const checkIcon = document.createElement('i')
    checkIcon.classList.add('fas')
    checkIcon.classList.add(checked ? 'fa-check-square' : 'fa-square')
    checkIcon.addEventListener('click', view.toggleChecked)
    checkIcon.addEventListener('mouseenter', () => document.body.style.cursor = 'pointer')
    checkIcon.addEventListener('mouseleave', () => document.body.style.cursor = 'default')

    const delIcon = document.createElement('i')
    delIcon.classList.add('fas')
    delIcon.classList.add('fa-trash-alt')
    delIcon.addEventListener('click', view.taskDeletion)
    delIcon.addEventListener('mouseenter', () => document.body.style.cursor = 'pointer')
    delIcon.addEventListener('mouseleave', () => document.body.style.cursor = 'default')

    const iconDiv = document.createElement('div')
    iconDiv.appendChild(checkIcon)
    iconDiv.append(' ')
    iconDiv.appendChild(delIcon)
    iconDiv.style.cssFloat = 'right'

    const listItem = document.createElement('li')
    listItem.classList.add('list-group-item')
    listItem.style.fontSize = '1.4em'
    listItem.innerText = title
    checked
      ? listItem.style.textDecoration = 'line-through'
      : listItem.classList.add('active')
    listItem.appendChild(iconDiv)

    return listItem
  }

  return {
    displayAll(tasks) {
      taskList.innerHTML = ''
      tasks
        .map(createListItem)
        .forEach(li => taskList.appendChild(li))
    },
    taskInput(evt) {
      evt.preventDefault()
      const title = inputField.value
      inputField.value = ''
      inputField.focus()
      if (title !== '') controller.saveTask({ title, checked: false })
    },
    taskDeletion(evt) {
      const title = evt.target.parentElement.parentElement.textContent.trim()
      controller.delTaskByTitle(title)
    },
    toggleChecked(evt) {
      const title = evt.target.parentElement.parentElement.textContent.trim()
      controller.changeTaskStatus(title)
    },
    displayError(msg) {
      errorDiv.style.display = ''
      errorMsg.innerText = msg
    }
  }
})()

const controller = {
  async init() {
    try {
      const response = await model.getTasks()
      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`)
      }
      let tasks = await response.json()
      model.setLocalTasks(tasks)
      view.displayAll(tasks)
    } catch (err) {
      view.displayError(err.message)
    }
  },
  async saveTask(task) {
    try {
      const response = await model.postTask(task)
      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`)
      }
      controller.init()
    } catch (err) {
      view.displayError(err.message)
    }
  },
  async delTaskByTitle(title) {
    const tasks = model.getLocalTasks()
    const [task] = tasks.filter(task => task.title === title)
    try {
      const response = await model.deleteTask(task.id)
      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`)
      }
      controller.init()
    } catch (err) {
      view.displayError(err.message)
    }
  },
  async changeTaskStatus(title) {
    const tasks = model.getLocalTasks()
    const [task] = tasks.filter(task => task.title === title)
    task.checked = !task.checked
    try {
      const response = await model.updateTask(task)
      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`)
      }
      controller.init()
    } catch (err) {
      view.displayError(err.message)
    }
  }
}

document.querySelector('#input-form').addEventListener('submit', view.taskInput)
document.querySelector('#close-error').addEventListener('click', () => {
  document.querySelector('#error-div').style.display = 'none'
})
document.addEventListener('DOMContentLoaded', controller.init)
