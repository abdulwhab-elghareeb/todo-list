import { projectsContainer } from "./projectsContainer.js"
import { Project } from "./Project.js"
import { Task } from "./Task.js"
import { Subtask } from "./Subtask.js"

import * as dom from "./dom.js"
import * as storage from "./storage.js"

import { toCamelCase, replaceEventListener } from "./helper.js"
import { intlFormatDistance } from "date-fns";
import { format } from "date-fns"



const projectsArray = projectsContainer.projectsArray

// Local storage & initial loading
if (!localStorage.getItem("projectsArray")){
    addDefaultProject()
    storage.saveProjectsArray(projectsArray)
    storage.saveCurrentProject(0) // the default project
}else{
    loadProjects()
    sessionStorage.clear()
}
showLastViewedProject()

function loadProjects(){
    storage.getProjectsArray().forEach(project => {
        const newProject = new Project(project.title, project.description)
        projectsContainer.addProjectToArray(newProject)
        
        project.tasksArray.forEach(task =>{
            const newTask = new Task(task.title, task.description, task.dueDate, task.priority, task.isCompleted)
            newProject.createTaskObj(newTask)

            task.subtasksArray.forEach(subtask =>{
                const newSubtask = new Subtask(subtask.title, subtask.isCompleted, subtask.preState)
                newTask.addSubtask(newSubtask)
            })
        })
    })
    renderProjectsSidebarList()
}


// Projects

function showLastViewedProject(){
    const currentProjectIdx = localStorage.getItem("currentProjectIdx")
    getProjectSidebarList(projectsArray[currentProjectIdx]).querySelector(".project-list-btn").click()
}

function addDefaultProject(){
    const defaultProject = new Project("Inbox", "")
    projectsContainer.addProjectToArray(defaultProject)
    renderProjectsSidebarList()    
    storage.saveProjectsArray(projectsArray)
}


// Project helpers
function getProjectSidebarList(project){
    return document.querySelector(`li[data-id="${project.id}"]`)
}


// Project Inputs
function addInputEventToTextInputs(){
    [...document.querySelectorAll("input[type='text']")].forEach((input) => replaceEventListener(input, "input", inputsEventHandler))
}

function inputsEventHandler(e){
    const currentInput = e.currentTarget
    if (currentInput.hasAttribute("required")){
         updateFormSubmitBtnAvailability(currentInput)
    }
    updateCharCount(currentInput)
}

function updateFormSubmitBtnAvailability(requiredInput){
    const formSubmitBtn = requiredInput.closest("dialog").querySelector("button[type='submit']");
    (requiredInput.checkValidity())? formSubmitBtn.removeAttribute("disabled") : formSubmitBtn.setAttribute("disabled","")
}

function updateCharCount(textInput){
    const charCounter = textInput.nextElementSibling
    charCounter.textContent = `${textInput.value.length} / ${textInput.maxLength}`
}


// Project dialog/form
function openDialog(){
    document.getElementById("project-dialog").showModal()
    addInputEventToTextInputs()
}
document.getElementById("sidebar-add-project-btn").addEventListener("click", openDialog)

function formSubmissionHandler(e){
    createProjectObj()
    renderProjectsSidebarList()
    disableFormSubmissionBtn()
    resetCharCounters()
    e.currentTarget.reset()
    clickNewProject()
    storage.saveProjectsArray(projectsArray)
}
document.querySelector("#project-dialog > form").addEventListener('submit', formSubmissionHandler)

function createProjectObj(){
    const projectTitleInput = document.getElementById("project-title")
    const projectDescriptionInput = document.getElementById("project-description")

    const project = new Project(projectTitleInput.value.trim(), projectDescriptionInput.value.trim())
    projectsContainer.addProjectToArray(project)
    updateProjectPageId(project)

    return project
}

function disableFormSubmissionBtn(){
    [...document.querySelectorAll("button[id*='submit']")].forEach((btn) => btn.setAttribute("disabled", ""))
}

function resetCharCounters(){
    [...document.querySelectorAll(".char-counter")].forEach(charCounter => charCounter.textContent = "")
}

function clickNewProject(){
    getProjectSidebarList(projectsArray.at(-1)).querySelector(".project-list-btn").click()
}


// Sidebar projects list
function renderProjectsSidebarList(){
    projectsArray.forEach(project =>{
        if (projectListAlreadyExists(project)) return

        const projectListItem = dom.createProjectSidebarListItem(project)
        const projectListTitle = dom.createProjectSidebarListTitle(project)
        const removeProjectBtn = createProjectRemoveBtn(project)
        const projectListBtn = createProjectListBtn(project)
        
        projectListBtn.append(projectListTitle, removeProjectBtn)
        projectListItem.append(projectListBtn)
        document.getElementById("projects-list").appendChild(projectListItem)
    })
}

function projectListAlreadyExists(project){
    return document.querySelector(`li[data-id='${project.id}'`)
}

function createProjectListBtn(project){
    const projectListBtn = dom.createProjectListBtn()
    projectListBtn.addEventListener("click", (e) => {
        renderProjectPage(project)
        focusSelectedProjectList(e)
        storage.saveCurrentProject(projectsArray.indexOf(getCurrentProject()))
    })    
    return projectListBtn
}

function createProjectRemoveBtn(project){
    const removeProjectBtn = dom.createProjectRemoveBtn()

    function removeBtnClickHandler(e){
        e.stopPropagation();

        const indexOfProject = projectsArray.indexOf(project)
        const prevOrNextProject = projectsArray[indexOfProject + 1] || projectsArray[indexOfProject - 1];  

        getProjectSidebarList(project).remove()
        projectsContainer.removeProjectFromArray(project)

        // if the length of array after project removal = 0 clear the main page otherwise click the prevOrNextProject
        if(projectsArray.length === 0){
            clearProjectPage() 
        }else{  
            const prevOrNextProjectListBtn = getProjectSidebarList(prevOrNextProject).querySelector(".project-list-btn") 
            prevOrNextProjectListBtn.click()
        }

        storage.saveProjectsArray(projectsArray)
    }
    removeProjectBtn.addEventListener("click", removeBtnClickHandler)

    return removeProjectBtn
}

function updateProjectListTitle(project){
    getProjectSidebarList(project).querySelector(".project-title").textContent = project.title
}

function focusSelectedProjectList(e){
    const allProjectLists = [...document.querySelectorAll("#sidebar li")]
    allProjectLists.forEach(projectLi => projectLi.querySelector(".project-list-btn").classList.remove("selected-project"))
    e.currentTarget.classList.add("selected-project")
}

function updateProjectPageId(project){
    document.getElementById("project-page").dataset.id = project.id
}


// Project page
function renderProjectPage(project){
    clearProjectPage()
    renderProjectPageInputs(project)
    renderAddTaskBtn(project)
    updateProjectPageId(project)
    renderProjectTasks(project)
}

function clearProjectPage(){
    [...document.querySelectorAll("#project-page .wrapper > div")].forEach(container => container.replaceChildren())
    if(document.getElementById("project-page-add-task-btn")) document.getElementById("project-page-add-task-btn").remove()
}

function renderProjectPageInputs(project){
    const projectPageTitleInput = dom.createProjectPageTitleInput(project)
    const projectPageDescriptionInput = dom.createProjectPageDescInput(project)
    const charCounter = dom.createInputCharCounter()
    const note = dom.createProjectPageNote()

    document.querySelector("#project-page .title-container").append(projectPageTitleInput, charCounter, note)
    document.querySelector("#project-page .description-container").append(projectPageDescriptionInput, charCounter.cloneNode(), note.cloneNode(true))
    // note.cloneNode(true) -> to clone the textContent too

    function inputsDoubleClickHandler(e){
        const projectPageInput = e.currentTarget
        const note = projectPageInput.parentNode.querySelector(".note")
        projectPageInput.removeAttribute("readonly")
        projectPageInput.focus()
        projectPageInput.select()
        if(note) note.remove()
    }

    function inputChangeEventHandler(e){
        if(e.target.id == "project-page-title" && e.target.value.trim().length < 2) return

        const projectPageInput = e.currentTarget
        projectPageInput.setAttribute("readonly", "")

        const lastWordOfInputName = projectPageInput.name.split("-").at(-1) // either title or description
        project[lastWordOfInputName] = projectPageInput.value.trim() 
        updateProjectListTitle(project)

        projectPageInput.nextElementSibling.textContent = "" // char counter
        storage.saveProjectsArray(projectsArray)
    }

    [projectPageTitleInput, projectPageDescriptionInput].forEach((projectPageInput) =>{
        projectPageInput.addEventListener("dblclick", inputsDoubleClickHandler)
        projectPageInput.addEventListener("change", inputChangeEventHandler)
    })
    addInputEventToTextInputs() 
}

function renderAddTaskBtn(){
    const createTaskObjBtn = dom.createTaskAddBtn()
    const requiredInput = getAllTaskFormElements().find(input => input.required)
    function openTaskDialog(e){
        document.querySelector("#tasks-dialog form").reset()
        updateFormSubmitBtnAvailability(requiredInput)
        renderTaskForm(e)
        document.querySelector("#tasks-dialog").showModal()
    }
    replaceEventListener(document.getElementById("sidebar-add-task-btn"), "click", openTaskDialog)
    createTaskObjBtn.addEventListener("click", openTaskDialog)

    document.querySelector("#project-page .description-container").after(createTaskObjBtn)
}



// Tasks
// Task helpers
function getCurrentProject(){
    const currentPageId = document.querySelector("#project-page").dataset.id
    return projectsArray.find((project) => project.id === currentPageId)
}

function getAllTaskFormElements(){
    return [...document.querySelector("#tasks-dialog form").elements]
}

function getTaskContainer(task){
    return document.querySelector(`.task-card[data-id='${task.id}']`)
}


// Task dialog/form
function renderTaskForm(e){
    renderProjectSelection()
    if(e.currentTarget.id === "project-page-add-task-btn")selectCurrentProject()
    selectDefaultDate()
    adjustTaskSubmitBtnText(e.currentTarget)
}

function renderProjectSelection(){
    const projectSelection = document.querySelector("#task-project")
    projectSelection.replaceChildren() // clear 

    const placeholder = dom.createPlaceholderOption()
    projectSelection.appendChild(placeholder)

    projectsArray.forEach((project) =>{
        const projectOption = dom.createProjectOption(project)
        projectSelection.appendChild(projectOption)
    })
}

function selectCurrentProject(){
    const projectSelection = document.querySelector("#task-project")
    projectSelection.selectedIndex = projectsArray.indexOf(getCurrentProject()) + 1
}

function selectDefaultDate(){
    const dateInput = document.querySelector("#task-due-date")
    Object.assign(dateInput, {
        min: format(new Date(), 'yyyy-MM-dd'),
        max: '2100-12-20',
    })
}

function adjustTaskSubmitBtnText(showDialogBtn){
    const submitBtn = document.querySelector("#task-dialog-submit-btn")
    showDialogBtn.id.includes("add-task-btn")? submitBtn.textContent = "Add" : submitBtn.textContent = "Save"
}

function formSubmitHandler(e){
    createTaskObj()
    renderProjectTasks(getCurrentProject())
    e.currentTarget.reset()
    resetCharCounters()
    storage.saveProjectsArray(projectsArray)
}
document.querySelector("#tasks-dialog form").addEventListener("submit", formSubmitHandler)

function createTaskObj(){
    const taskFormElements = getAllTaskFormElements()
    const titleValue = taskFormElements[0].value.trim()
    const descriptionValue = taskFormElements[1].value.trim()
    const dueDateValue = taskFormElements[2].value
    const priorityValue = taskFormElements[3].value
    const selectedProjectIdx = taskFormElements[4].selectedIndex - 1

    const task = new Task(titleValue, descriptionValue, dueDateValue, priorityValue)
    projectsArray[selectedProjectIdx].addTask(task)

    storage.saveProjectsArray(projectsArray)

    return task
}

// Editing tasks
function createCardContainer(task){
    const taskCardContainer = dom.createTaskCardContainer(task)
    function taskContainerClickHandler(e){
        renderTaskForm(e)
        
        const tasksDialog = document.querySelector("#tasks-dialog")
        tasksDialog.showModal()

        const taskFormElements = getAllTaskFormElements()
        setupFormElementsValues(taskFormElements, task)
        updateFormSubmitBtnAvailability(taskFormElements.find(input => input.required))
        taskFormElements.filter(input => input.type === "text").forEach(textInput => updateCharCount(textInput))
        
        const saveBtn = document.querySelector("#task-dialog-submit-btn")
        function saveBtnHandler(e){
            e.preventDefault()

            updateTaskObjectValues(taskFormElements, task)
            updateDisplayedTask(task)
            renderProjectPage(getCurrentProject())

            document.querySelector("#tasks-dialog form").reset()
            tasksDialog.close()
            storage.saveProjectsArray(projectsArray)
        }
        saveBtn.addEventListener("click", saveBtnHandler, {once:true}) // setting once to avoid duplicate listeners

        document.querySelector(".task-close-btn").addEventListener("click", () =>{
            saveBtn.removeEventListener("click", saveBtnHandler)
        }, {once:true})
    }
    taskCardContainer.addEventListener("click", taskContainerClickHandler)

    return taskCardContainer
}

function setupFormElementsValues(taskFormElements, task){
    taskFormElements.forEach(formElement =>{
        if (formElement.id === "task-project"){
            selectCurrentProject()
        }else{
            const inputIdToTaskProperty = toCamelCase(formElement.id, 1)
            formElement.value = task[inputIdToTaskProperty]
        }
    })
}

function updateTaskObjectValues(taskFormElements, task){
    taskFormElements.forEach(formElement => {
        if (formElement.id === "task-project"){
            moveTaskToSelectedProjects(formElement, task)
        }else{
            const inputIdToTaskProperty = toCamelCase(formElement.id, 1)
            task[inputIdToTaskProperty] = formElement.value
        }
    }) 
}

function moveTaskToSelectedProjects(projSelection, task){
    const selectedProject = projectsArray[projSelection.selectedIndex -1]
    if (selectedProject === getCurrentProject()) return
    getCurrentProject().removeTask(task)
    selectedProject.createTaskObj(task)
    storage.saveProjectsArray(projectsArray)
}

function updateDisplayedTask(task){
    const taskContainer = getTaskContainer(task)
    const taskTitle = taskContainer.querySelector('.task-displayed-title')
    const taskDueDate = taskContainer.querySelector('.task-due-date')

    taskTitle.textContent = task.title
    taskDueDate.textContent = (task.dueDate)? intlFormatDistance(task.dueDate, new Date()) : "Anytime"
    displayPriority(task)
}


// Creating task
function renderProjectTasks(project){
    if (!project) return
    project.tasksArray.forEach((task) => {
        if (taskAlreadyDisplayed(task)) return
        
        const cardMainContent = createTaskMainContent(task)
        const taskCardContainer = createCardContainer(task)
        const taskCheckBtn = createCheckBtn(task)
        const taskTitle = cardMainContent.cardTitle
        const taskDueDate = cardMainContent.cardDueDate
        const taskDelBtn = createTaskDelBtn(task)
        const taskExpandBtn = createExpandBtn(task)
        const cardsContainer = document.querySelector("#cards-container")
        const projectPage = document.querySelector("#project-page .wrapper")

        taskCardContainer.append(taskCheckBtn, taskTitle,  taskDueDate, taskDelBtn, taskExpandBtn)
        cardsContainer.appendChild(taskCardContainer)
        projectPage.appendChild(cardsContainer)
        displayPriority(task)
        updateCheckBtn(task, taskCheckBtn)

        if(checkIfTaskIsExpanded(task)) taskExpandBtn.click()
    })
}

function taskAlreadyDisplayed(task){
    return document.querySelector(`*[data-id='${task.id}'`)
}

function createTaskMainContent(task){
    const cardTitle = dom.createCardTitle(task)
    const cardDueDate = dom.createCardDueDate(task)
    return {cardTitle, cardDueDate}
}

function createCheckBtn(task){
    const checkBtn = dom.createCheckBtn()
    checkBtn.addEventListener("click", (e) => checkBtnClickHandler(e, task))

    return checkBtn
}

function checkBtnClickHandler(e, task){
    e.stopPropagation()
    task.toggleState()
    updateCheckBtn(task, e.currentTarget)

    if(task.isCompleted){
        checkAllSubtasks(task)

    }else{
        revertSubtasks(task)
    }

    storage.saveProjectsArray(projectsArray)
}

function updateCheckBtn(task, checkBtn){
    (task.isCompleted)? checkBtn.classList.add("checked") : checkBtn.classList.remove("checked")
}

function checkAllSubtasks(task){
    if (!task.subtasksArray ) return // if it's called from subtask

    task.subtasksArray.forEach(subtask => {
        subtask.preState = subtask.isCompleted
        subtask.isCompleted = true

        if(isExpanded(getTaskContainer(task))){
            updateCheckBtn(subtask, getSubtaskLI(subtask).querySelector(".task-check-btn"))
        }
    })

}

function revertSubtasks(task){
    if (!task.subtasksArray ) return // if it's called from subtask

    task.subtasksArray.forEach(subtask => {
        subtask.isCompleted = subtask.preState

        if(isExpanded(getTaskContainer(task))){
            updateCheckBtn(subtask, getSubtaskLI(subtask).querySelector(".task-check-btn"))
        }
    })
}

function createTaskDelBtn(task){
    const delBtn = dom.createCardDelBtn()
    function delBtnClickHandler(e){
        e.stopPropagation()
        getCurrentProject().removeTask(task)
        e.target.closest(".task-card").remove()
        storage.saveProjectsArray(projectsArray)

    }
    delBtn.addEventListener("click", delBtnClickHandler )

    return delBtn
}

function createExpandBtn(task){
    const expandBtn = dom.createExpandBtn()
    function expandBtnClickHandler(e){
        e.stopPropagation()
        const taskCardContainer = expandBtn.closest(".task-card")
        expandCard(taskCardContainer)

        if (isExpanded(taskCardContainer)){
            const ul = addInitialSubtasksList(taskCardContainer)
            if (!subtasksLimitReached(task)){
                ul.append(createAddSubtaskBtnList(task))
            }
            renderTaskSubtasks(task)
            renderTaskDescription(task)
            storage.saveTaskExpanded(task.id, true) 
        }else{
            clearTask(taskCardContainer)
            storage.saveTaskExpanded(task.id, false) 
        }
    }
    expandBtn.addEventListener("click", expandBtnClickHandler)
    return expandBtn
}

function expandCard(card){
    card.classList.toggle("expanded")
}

function isExpanded(card){
    return card.classList.contains("expanded")
}

function clearTask(card){
    const ul = card.querySelector(".subtasks-list")
    ul.replaceChildren()
    card.querySelector(".description-container").remove()
}

function checkIfTaskIsExpanded(task){
    return JSON.parse(sessionStorage.getItem(task.id))
}


function addInitialSubtasksList(currentTaskCard){
    const subtasksList = currentTaskCard.querySelector("ul") || dom.createSubtasksUL()
    subtasksList.addEventListener("click", (e)=> e.stopPropagation())

    currentTaskCard.appendChild(subtasksList)

    return subtasksList
}

function displayPriority(task){
    const taskContainer = getTaskContainer(task)
    switch(Number(task.priority)){
        case 4:
            taskContainer.style.borderColor = "hsl(0, 100%, 40%)"
            taskContainer.style.fontWeight = "700"
            break

        case 3:
            taskContainer.style.borderColor = "hsl(19, 100%, 50%)"
            taskContainer.style.fontWeight = "600"
            break

        case 2:
            taskContainer.style.borderColor = "hsl(55, 100%, 45%)"
            taskContainer.style.fontWeight = "500"
            break

        case 1:
            taskContainer.style.borderColor = "hsl(120, 100%,50%)"
            taskContainer.style.fontWeight = "500"
    }
}


// Subtasks
function createAddSubtaskBtnList(task){
    
    const subtasksListItem = dom.createAddBtnList()
    const addSubtaskBtn = subtasksListItem.querySelector("button")
    addSubtaskBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        const form = createSubtaskForm(task)       
        subtasksListItem.before(form)

        const input = form.querySelector("input")
        input.focus()
        input.select()
        input.addEventListener("input", (e) => updateCharCount(e.currentTarget))

        subtasksListItem.remove()
    })
    return subtasksListItem
}

function subtasksLimitReached(task){
    return task.subtasksArray.length === task.maxArrayLength
}

function getSubtasksUL(childElem="", taskId=""){
    if (childElem) return childElem.closest("ul")
    if (taskId) return document.querySelector(`.task-card[data-id="${taskId}"] ul`)
}

function getSubtaskLI(subtask){
    return document.querySelector(`li:has(.subtask-card[data-id="${subtask.id}"])`)
}

function createDisplaySubtask(task, subtask){
    const checkBtn = createSubtaskCheckBtn(subtask, task)
    const title = createSubtaskTitleInput(task, subtask)
    const delBtn = createSubTaskDelBtn(subtask, task)
    const listCard = createSubtaskCardContainer(subtask)
    const li = dom.createSubtaskLI()

    listCard.append(checkBtn, title, delBtn)
    li.append(listCard)
    
    return li
}

function checkBtnEventHandler(task, checkBtn, subtask){
    const parentTaskCheckBtn = getSubtasksUL(checkBtn).closest(".task-card").querySelector(".task-check-btn")

    if(task.subtasksArray.length === 0) return

    if(!subtask.isCompleted && task.isCompleted){ // all subtasks must be completed
        task.toggleState()
        updateCheckBtn(task, parentTaskCheckBtn)
    }

    if(task.subtasksArray.every(subtask => subtask.isCompleted) && !task.isCompleted){ // if every subtask is completed then the task is completed
        task.toggleState()
        updateCheckBtn(task, parentTaskCheckBtn)
    }

    storage.saveProjectsArray(projectsArray)

}

function createSubtaskCheckBtn(subtask, task){
    const checkBtn = createCheckBtn(subtask)
    checkBtn.addEventListener("click", () => checkBtnEventHandler(task, checkBtn, subtask))

    return checkBtn
}


function createSubTaskDelBtn(subtask, task){
    const delBtn = dom.createCardDelBtn()
    delBtn.addEventListener("click", () =>{
        if (subtasksLimitReached(task)){
            getSubtasksUL(delBtn).appendChild(createAddSubtaskBtnList(task))
        }

        task.removeSubtask(subtask)
        checkBtnEventHandler(task, getSubtaskLI(subtask).querySelector(".task-check-btn"), subtask)
        getSubtaskLI(subtask).remove()    

        storage.saveProjectsArray(projectsArray)
    })

    return delBtn
}

function createSubtaskObject(task, titleValue=""){
    const subtask = new Subtask(titleValue)
    task.addSubtask(subtask)
    return subtask
}

function createSubtaskTitleInput(task, subtask, {option ="subtask"} = {}){

    const subtaskTitleInput = (option === "form")? dom.createSubtaskTitleInput("") : dom.createSubtaskTitleInput(subtask.title)

    subtaskTitleInput.addEventListener("change", (e) =>{
        if(e.target.value.trim().length < 2) return

        e.stopPropagation()

        if (option != "form") subtask.title = e.target.value.trim()
        e.target.blur()
        renderTaskSubtasks(task)

        storage.saveProjectsArray(projectsArray)
    })

    return subtaskTitleInput
}

function createSubtaskCardContainer(subtask){
    const container = createCardContainer(subtask).cloneNode()
    container.classList.add("subtask-card")
    return container
}


function renderTaskSubtasks(task){
    task.subtasksArray.forEach((subtask) =>{
        if(subtaskAlreadyDisplayed(subtask)) return

        const displaySubtask = createDisplaySubtask(task, subtask)
        const subtasksUl = getSubtasksUL("", task.id)

        if (addSubtaskBtnExists(subtasksUl)){
            subtasksUl.querySelector("li:has(.add-subtask-btn)").before(displaySubtask)
        }else{
            subtasksUl.appendChild(displaySubtask)
        }

        const subtaskLI = getSubtaskLI(subtask)
        subtaskLI.querySelector("input").value = subtask.title
        updateCheckBtn(subtask, subtaskLI.querySelector(".task-check-btn"))
    })

}

function subtaskAlreadyDisplayed(subtask){
    return getSubtaskLI(subtask)
}

function addSubtaskBtnExists(ul){
    return ul.querySelector("li:has(.add-subtask-btn)")
}

function createSubtaskForm(task){
    const listItem = dom.createFormList()
    const subtaskForm = listItem.querySelector("form")
    const input = createSubtaskTitleInput(task, "", {option:"form"})
    const cancelBtn = subtaskForm.querySelector(".subtask-cancel")

    subtaskForm.prepend(input)

    cancelBtn.addEventListener("click", (e)=>{
        e.currentTarget.closest("li").remove()

        if (!subtasksLimitReached(task)){    
            getSubtasksUL("",task.id).append(createAddSubtaskBtnList(task))
        }
    })

    subtaskForm.addEventListener("submit", (e) =>{
        e.preventDefault()

        const subtask = createSubtaskObject(task, input.value.trim())
        renderTaskSubtasks(task)
        checkBtnEventHandler(task, getSubtaskLI(subtask).querySelector(".task-check-btn"), subtask)
        e.currentTarget.reset()
        cancelBtn.click()
        storage.saveProjectsArray(projectsArray)
    })

    return listItem
}

function renderTaskDescription(task){
    const container = dom.createDescriptionContainer(task)
    getTaskContainer(task).appendChild(container)
}