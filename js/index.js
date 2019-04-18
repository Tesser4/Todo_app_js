
const toggleChecked = evt => {
  console.dir(evt)
}

const deleteTask = evt => {
  console.dir(evt)
}

const model = (() => {
  const jsonServer = 'http://localhost:3000/todos'
  let localState

  return {
    getTasks: async () => {
      localState = await fetch(jsonServer).then(res => res.json())
      return localState
    },
    getLocalTasks: () => localState,
    postTask: async task => {
      await fetch(jsonServer, {
        method: 'POST',
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
    checkIcon.addEventListener('click', toggleChecked)

    const delIcon = document.createElement('i')
    delIcon.classList.add('fas')
    delIcon.classList.add('fa-trash-alt')
    delIcon.addEventListener('click', deleteTask)

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
    displayAll: tasks => {
      taskList.innerHTML = ''
      tasks
        .map(createListItem)
        .forEach(li => taskList.appendChild(li))
    },
    taskInput: evt => {
      evt.preventDefault()
      const title = inputField.value
      inputField.value = ''
      inputField.focus()
      if (title !== '') controller.saveTask({ title, checked: false })
    }
  }
})()

const controller = {
  init: async () => {
    const tasks = await model.getTasks()
    view.displayAll(tasks)
  },
  saveTask: async task => await model.postTask(task)
}

document.querySelector('#task-input-form').addEventListener('submit', view.taskInput)
document.addEventListener('DOMContentLoaded', controller.init)

