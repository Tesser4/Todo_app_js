
const model = (() => {
  const jsonServer = 'http://localhost:3000/todos/'

  return ({ method, task }) => {
    const id = method === 'get' || method === 'post'
      ? ''
      : task.id
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    }
    return fetch(jsonServer + id, options)
  }
})()

const view = (() => {
  const taskList = document.querySelector('#task-list')
  const inputField = document.querySelector('#task-input')
  const errorDiv = document.querySelector('#error-div')
  const errorMsg = document.querySelector('#error-msg')
  const progressDiv = document.querySelector('#progress-div')
  const progressBar = document.querySelector('#progress-bar')

  const createListItem = ({ id, title, checked = false }) => {
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
    listItem.id = `${id}`
    listItem.textContent = title
    checked
      ? listItem.style.textDecoration = 'line-through'
      : listItem.classList.add('active')
    listItem.appendChild(iconDiv)

    return listItem
  }

  const getProgress = tasks =>
    tasks
      .reduce((a, c) => {
        if (c.checked) a[0] += 1
        return a
      }, [0, tasks.length])
      .reduce((a, c) => Math.floor(a * 100 / c))

  const fireProgressBar = progress => {
    progressDiv.style.display = ''
    progressBar.style.width = `${progress}%`
    progressBar.setAttribute('aria-valuenow', `${progress}`)
  }

  return {
    displayAll(tasks = []) {
      taskList.innerHTML = ''
      tasks.length
        ? fireProgressBar(getProgress(tasks))
        : progressDiv.style.display = 'none'
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
      const id = evt.target.parentElement.parentElement.id
      controller.delTaskById(id)
    },
    toggleChecked(evt) {
      const id = evt.target.parentElement.parentElement.id
      controller.changeTaskStatusById(id)
    },
    displayError(msg) {
      errorDiv.style.display = ''
      errorMsg.textContent = msg
    }
  }
})()

const controller = (() => {
  let localState

  const getTaskById = id => {
    const [task] = localState.filter(task => task.id === +id)
    return task
  }

  const callModel = async options => {
    try {
      const response = await model(options)
      if (!response.ok)
        throw new Error(`Status ${response.status}: ${response.statusText}`)
      if (options.method === 'get') localState = await response.json()
      else controller.init()
    } catch (err) {
      view.displayError(err.message)
    }
  }

  return {
    async init() {
      await callModel({ method: 'get' })
      view.displayAll(localState)
    },
    async saveTask(task) {
      await callModel({ method: 'post', task })
    },
    async delTaskById(id) {
      const task = getTaskById(id)
      await callModel({ method: 'delete', task })
    },
    async changeTaskStatusById(id) {
      const task = getTaskById(id)
      task.checked = !task.checked
      await callModel({ method: 'put', task })
    }
  }
})()

document.querySelector('#input-form').addEventListener('submit', view.taskInput)
document.querySelector('#close-error').addEventListener('click', evt => {
  evt.target.parentElement.style.display = 'none'
})
document.addEventListener('DOMContentLoaded', controller.init)
