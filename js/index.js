
const model = (() => {
  const jsonServer = 'http://localhost:3000/todos/'
  let localState

  return {
    async getTasks() {
      localState = await fetch(jsonServer).then(res => res.json())
      return localState
    },
    getLocalTasks() {
      return localState
    },
    async postTask(task) {
      await fetch(jsonServer, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })
    },
    async deleteTask(id) {
      await fetch(jsonServer + id, {
        method: 'DELETE',
      })
    },
    async updateTask(task) {
      const { id } = task
      await fetch(jsonServer + id, {
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

  const createListItem = ({ title, checked = false }) => {
    const checkIcon = document.createElement('i')
    checkIcon.classList.add('fas')
    checkIcon.classList.add(checked ? 'fa-check-square' : 'fa-square')
    checkIcon.addEventListener('click', view.toggleChecked)

    const delIcon = document.createElement('i')
    delIcon.classList.add('fas')
    delIcon.classList.add('fa-trash-alt')
    delIcon.addEventListener('click', view.taskDeletion)

    const iconDiv = document.createElement('div')
    iconDiv.appendChild(checkIcon)
    iconDiv.append(' ')
    iconDiv.appendChild(delIcon)
    iconDiv.style.cssFloat = 'right'

    const listItem = document.createElement('li')
    listItem.classList.add('list-group-item')
    listItem.innerText = title
    if (checked) listItem.style.textDecoration = 'line-through'
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
    }
  }
})()

const controller = {
  async init() {
    view.displayAll(await model.getTasks())
  },
  async saveTask(task) {
    await model.postTask(task)
    view.displayAll(await model.getTasks())
  },
  async delTaskByTitle(title) {
    const tasks = model.getLocalTasks()
    const [task] = tasks.filter(task => task.title === title)
    await model.deleteTask(task.id)
    view.displayAll(await model.getTasks())
  },
  async changeTaskStatus(title) {
    const tasks = model.getLocalTasks()
    const [task] = tasks.filter(task => task.title === title)
    task.checked = !task.checked
    await model.updateTask(task)
    view.displayAll(await model.getTasks())
  }
}

document.querySelector('#input-form').addEventListener('submit', view.taskInput)
document.addEventListener('DOMContentLoaded', controller.init)

