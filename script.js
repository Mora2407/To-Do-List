let inputList = document.querySelector(".input-list")
let listInputButton = document.querySelector(".list-input-button")
let listContainer = document.querySelector(".list-container")
let taskContainer = document.querySelector(".task-container")
let taskContainerUncompleted = document.querySelector(".task-container-uncompleted")
let taskContainerCompleted = document.querySelector(".task-container-completed")
let tasks = document.querySelector(".tasks")
let inputTask = document.querySelector(".input-task")
let taskInputButton = document.querySelector(".task-input-button")
let deleteListButton = document.querySelector(".delete-list")
let horizontalLine = document.querySelector(".horizontal-line")
let listTitle = document.querySelector(".list-name")
let taskInfo = document.querySelector(".task-info")
let taskInfoTitle = document.querySelector(".task-text")
let taskDate = document.querySelector(".task-date")
let taskNote = document.querySelector(".task-note")

let selectedList = {
    name: "",
    id: 0,
    element: {}
}

function getList(key = " ") {
    return JSON.parse(localStorage.getItem(key))
}

function updateList() {
    let lists = getList()
    for (i = 0; i < lists.length; i++) {
        const card = document.createElement("div")
        const list = getList(lists[i])
        card.classList.add("list-card")
        card.innerText = list.name
        card.onclick = select
        card.setAttribute("id", list.id)
        listContainer.appendChild(card)
    }
}

function addList(event) {
    let lists = getList()
    let listName = inputList.value
    if (listName.trim() == "") return
    else {
        const ID = Date.now()
        lists.push(ID)
        localStorage.setItem(" ", JSON.stringify(lists))
        localStorage.setItem(ID, JSON.stringify({
            name: listName,
            id: ID,
            uncompleted: [],
            completed: []
        }))

        const card = document.createElement("div")
        card.classList.add("list-card")
        card.innerText = listName
        card.onclick = select
        card.setAttribute("id", ID)
        listContainer.appendChild(card)
    }
}

function deleteList (event) {
    localStorage.removeItem(selectedList.id)

    let lists = getList()
    lists = lists.filter(list => list != selectedList.id)
    localStorage.setItem(" ", JSON.stringify(lists))
    selectedList.element.remove()

    selectedList.name = ""
    selectedList.element = {}
    selectedList.id = 0
    updateTask(event)
}

//Bikin list baru pas pertama kali masuk
window.onload = (event) => {
    if (!localStorage.getItem(" ")) {
        localStorage.setItem(" ", JSON.stringify([]))
    }   

    tasks.style.display = "none";

    //Update list
    updateList()
}

listInputButton.onclick = (event) => {
    addList(event)
    inputList.value = ""
}

function select(event) {
    if (selectedList.id == 0) {
        selectedList.name = event.target.innerText
        selectedList.element = event.target
        selectedList.id = event.target.id
        event.target.innerText = `〉${event.target.innerText}`
        event.target.style.backgroundColor = "#252525"
    } else {
        selectedList.element.style.backgroundColor = ""
        selectedList.element.innerText = selectedList.element.innerText.slice(1)
        selectedList.name = event.target.innerText
        selectedList.element = event.target
        selectedList.id = event.target.id
        event.target.innerText = `〉${event.target.innerText}`
        event.target.style.backgroundColor = "#252525"
    }

    updateTask(event)
}

taskInputButton.onclick = addTask

function updateTask(event) {
    tasks.style.display = "grid"

    if (selectedList.name == "") {
        tasks.style.display = "none"
        return;
    }

    taskContainerCompleted.innerHTML = ""
    taskContainerUncompleted.innerHTML = ""

    let list = getList(selectedList.id)
    listTitle.innerText = selectedList.name

    if (list.completed.length > 0 && list.uncompleted.length > 0) horizontalLine.hidden = false
    else horizontalLine.hidden = true

    for (i = 0; i < list.uncompleted.length; i++) {
        const task = list.uncompleted[i]
        const card = document.createElement("div")
        card.classList.add("task-card")
        card.innerText = task.text
        card.setAttribute("id", task.id)
        card.setAttribute("draggable", true)
        card.setAttribute("completed", false)
        card.ondragstart = dragTask
        card.onclick = taskSelect
        card.oncontextmenu = completeTask

        taskContainerUncompleted.appendChild(card)
    }

    for (i = 0; i < list.completed.length; i++) {
        const task = list.completed[i]
        const card = document.createElement("div")
        card.classList.add("task-card")
        card.innerText = task.text
        card.setAttribute("id", task.id)
        card.setAttribute("draggable", true)
        card.setAttribute("completed", true)
        card.ondragstart = dragTask
        card.oncontextmenu = completeTask
        card.onclick = taskSelect
        card.style.opacity = "50%"
        card.style.textDecoration = "line-through"

        taskContainerCompleted.appendChild(card)
    }

}

function addTask(event) {
    let currentTask = getList(selectedList.id)
    if (inputTask.value.trim() == "") return
    else {
        const ID = Date.now()
        currentTask.uncompleted.push({
            text: inputTask.value,
            id: ID,
            date: "",
            note: ""
        })
        localStorage.setItem(selectedList.id, JSON.stringify(currentTask))

        updateTask()
        inputTask.value = ""
    }
}

deleteListButton.ondblclick = deleteList

function allowDrop (event) {
    event.preventDefault()
}

function dragTask (event) {
    event.dataTransfer.setData("text", event.target.innerText)
    event.dataTransfer.setData("id", event.target.id)
}

function deleteTask (event) {
    event.preventDefault()
    let taskText = event.dataTransfer.getData("task")
    let taskId = event.dataTransfer.getData("id")
    let currentTask = getList(selectedList.id)
    currentTask.uncompleted = currentTask.uncompleted.filter(task => task.id != taskId)
    currentTask.completed = currentTask.completed.filter(task => task.id != taskId)
    localStorage.setItem(selectedList.id, JSON.stringify(currentTask))
    document.getElementById(taskId).remove()
    updateTask()
}

function completeTask (event) {
    event.preventDefault()
    let state = event.target.getAttribute("completed")
    let taskId = event.target.getAttribute("id")
    let tasks = getList(selectedList.id)
    if (state == "true") {
        let currentTask = tasks.completed.find(task => task.id == taskId)
        tasks.uncompleted.push(currentTask)
        tasks.completed = tasks.completed.filter(task => task.id != taskId)
    } else {
        let currentTask = tasks.uncompleted.find(task => task.id == taskId)
        tasks.completed.push(currentTask)
        tasks.uncompleted = tasks.uncompleted.filter(task => task.id != taskId)
    }

    event.target.remove()
    localStorage.setItem(selectedList.id, JSON.stringify(tasks))
    updateTask()
}

let selectedTask = {
    id: 0,
    text: "",
    element: {}
}

function taskSelect(event) {
    delay = true

    let ID = event.target.id
    let selected = document.getElementById(ID)
    if (selectedTask.id == ID) {
        selectedTask.id = 0
        selectedTask.text = ""
        selectedTask.element = {}
        taskInfo.style.display = "none"
        taskInfoTitle.innerText = ""
        selected.style.backgroundColor = "#252525"
    } else {
        if (selectedTask.id != 0) {
            let prev = document.getElementById(selectedTask.id)
            prev.style.backgroundColor = "#252525"
        }

        selectedTask.id = event.target.id
        selectedTask.text = event.target.innerText
        selectedTask.element = event.target
        taskInfo.style.display = "flex"
        taskInfoTitle.innerText = selectedTask.text

        selected.style.backgroundColor = "#353535"

        let task = getList(selectedList.id)
        let task2;
        if (selected.getAttribute("completed") == "false") {
            task2 = task.uncompleted.find(x => x.id == selectedTask.id)
        } else {
            task2 = task.completed.find(x => x.id == selectedTask.id)
        }
        taskDate.value = task2.date || ""
        taskNote.value = task2.note || "" 
    }
}

taskDate.onchange = (event) => {
    let selected = document.getElementById(selectedTask.id)
    let task = getList(selectedList.id)
    let task2;
        if (selected.getAttribute("completed") == "false") {
            task2 = task.uncompleted.find(x => x.id == selectedTask.id)
        } else {
            task2 = task.completed.find(x => x.id == selectedTask.id)
        }
    task2.date = taskDate.value
    localStorage.setItem(selectedList.id, JSON.stringify(task))
}

taskNote.onchange = (event) => {
    let selected = document.getElementById(selectedTask.id)
    let task = getList(selectedList.id)
    let task2;
        if (selected.getAttribute("completed") == "false") {
            task2 = task.uncompleted.find(x => x.id == selectedTask.id)
        } else {
            task2 = task.completed.find(x => x.id == selectedTask.id)
        }
    task2.note = taskNote.value
    localStorage.setItem(selectedList.id, JSON.stringify(task))
}