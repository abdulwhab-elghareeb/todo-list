
import { projectsContainer } from "./projectsContainer.js"
import { Project } from "./Project.js"
import { Task } from "./Task.js"

import {toCamelCase, replaceEventListener} from "./helper.js"
import { intlFormatDistance } from "date-fns";
import { format } from "date-fns"
import { Subtask } from "./Subtask.js"

import * as dom from "./dom.js"
import * as storage from "./storage.js"



const projectsArray = projectsContainer.projectsArray
// localStorage initial loading

if (!localStorage.getItem("projectsArray")){
    addDefaultProject()
    storage.saveProjectsArray(projectsArray)
}else{
    loadProjects()
}


function loadProjects(){
    storage.getProjectsArray().forEach(project => {
        const newProject = new Project(project.title, project.description)
        projectsContainer.addProjectToArray(newProject)

        project.tasksArray.forEach(task =>{
            const newTask = new Task(task.title, task.description, task.dueDate, task.priority)
            newProject.addTask(newTask)

            task.subtasksArray.forEach(subtask =>{
                const newSubtask = new Subtask(subtask.title)
                newTask.addSubtask(newSubtask)
            })
        })

        renderProjects()
        
    })
}

// Projects
function addDefaultProject(){
    const defaultProject = new Project("Default", "This is the default project")
    defaultProject.default = true
    projectsContainer.addProjectToArray(defaultProject)
    renderProjects()    
    storage.saveProjectsArray(projectsArray)
}

function toggleSidebar(e){
    const sidebar = document.querySelector("#sidebar")
    const projectPage = document.querySelector("#project-page");
    
    [e.currentTarget, sidebar, projectPage].forEach(sidebarTransitionElem => sidebarTransitionElem.classList.toggle("sidebar-close"))
}
document.querySelector("#sidebar-toggling-btn").addEventListener("click", toggleSidebar)


function inputsEventHandler(e){
    const currentInput = e.currentTarget
    if (inputIsRequired(currentInput)) updateFormSubmitBtnAvailability(currentInput)
    updateCharCount(currentInput)
}

function inputIsRequired(input){
    return input.hasAttribute("required")
}

function updateFormSubmitBtnAvailability(requiredInput){
    const activeFormDialog = requiredInput.closest("dialog")
    const formSubmitBtn = activeFormDialog.querySelector("button[type='submit']");

    (requiredInput.checkValidity())? formSubmitBtn.removeAttribute("disabled") : formSubmitBtn.setAttribute("disabled","")
}

function updateCharCount(textInput){
    const charCounter = textInput.nextElementSibling
    charCounter.textContent = `${textInput.value.length} / ${textInput.maxLength}`
}

function resetCharCounters(){
    [...document.querySelectorAll(".char-counter")].forEach(charCounter => charCounter.textContent = "")
}


function addInputEventToTextInputs(){
    [...document.querySelectorAll("input[type='text']")].forEach((input) => replaceEventListener(input, "input", inputsEventHandler))
}

function openDialog(){
    document.getElementById("project-dialog").showModal()
    addInputEventToTextInputs()
}
document.querySelector("#sidebar-add-project-btn").addEventListener("click", openDialog)



function createProjectObj(){
    const projectTitleInput = document.getElementById("project-title")
    const projectDescriptionInput = document.getElementById("project-description")

    const project = new Project(projectTitleInput.value.trim(), projectDescriptionInput.value.trim())
    projectsContainer.addProjectToArray(project)
    updateProjectPageId(project)

    return project
}

function updateProjectPageId(project){
    document.getElementById("project-page").dataset.id = project.id
}


function createProjectRemoveBtn(project){
    const removeProjectBtn = dom.createProjectRemoveBtn()

    function removeBtnClickHandler(e){
        e.stopPropagation();

        const indexOfProject = projectsArray.indexOf(project)
        const prevOrNextProject = projectsArray[indexOfProject - 1] || projectsArray[indexOfProject + 1];  

        getProjectSidebarList(project).remove()
        projectsContainer.removeProjectFromArray(project)

        // if the length of array after project removal = 0 clear the main page otherwise click the prevOrNextProject
        if(projectsArray.length === 0){
            clearProjectPage() 
        }else{   
            const prevOrNextProjectPageLoader = document.querySelector(`li[data-id="${prevOrNextProject.id}"] .project-page-loader`) 
            prevOrNextProjectPageLoader.click()
        }

        storage.saveProjectsArray(projectsArray)
    }
    removeProjectBtn.addEventListener("click", removeBtnClickHandler)

    return removeProjectBtn
}

function getProjectSidebarList(project){
    return document.querySelector(`li[data-id="${project.id}"]`)
}


function clearProjectPage(){
    [...document.querySelectorAll("#project-page .wrapper > div")].forEach(container => container.replaceChildren())
}

function renderProjectPage(project){
    clearProjectPage()
    renderProjectTasks(project)
    updateProjectPageId(project)
    renderProjectPageInputs(project)
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
        projectPageInput.removeAttribute("readonly")
        projectPageInput.parentNode.querySelector(".note").remove()
    }

    function inputChangeEventHandler(e){
        const projectPageInput = e.currentTarget
        projectPageInput.setAttribute("readonly", "")

        const lastWordOfInputName = projectPageInput.name.split("-").at(-1) // either title or description
        project[lastWordOfInputName] = projectPageInput.value.trim() 
        updateProjectListTitle(project)

        projectPageInput.nextElementSibling.textContent = ""
        storage.saveProjectsArray(projectsArray)
    }

    [projectPageTitleInput, projectPageDescriptionInput].forEach((projectPageInput) =>{
        projectPageInput.addEventListener("dblclick", inputsDoubleClickHandler)
        projectPageInput.addEventListener("change", inputChangeEventHandler)
    })
    addInputEventToTextInputs() 
}

function updateProjectListTitle(project){
    document.querySelector(`li[data-id="${project.id}"] .project-title`).textContent = project.title
}

function focusCurrentProjectLi(e){
    const allLiElem = [...document.querySelectorAll("#sidebar li")]
    allLiElem.forEach(projectLi => projectLi.querySelector(".project-page-loader").classList.remove("selected-project"))
    e.currentTarget.classList.add("selected-project")
}

function createProjectPageLoader(project){
    const projectPageLoader = dom.createProjectPageLoader()
    projectPageLoader.addEventListener("click", (e) => {
        renderProjectPage(project)
        focusCurrentProjectLi(e)
    })
    projectPageLoader.click()
    
    return projectPageLoader
}


function renderProjects(){
    projectsArray.forEach(project =>{
        if (projectAlreadyExists(project)) return

        const projectListItem = dom.createProjectSidebarListItem(project)
        const projectListTitle = dom.createProjectSidebarListTitle(project)
        const removeProjectBtn = createProjectRemoveBtn(project)
        const projectPageLoader = createProjectPageLoader(project)
        
        projectPageLoader.append(projectListTitle, removeProjectBtn)
        projectListItem.append(projectPageLoader)
        document.getElementById("projects-list").appendChild(projectListItem)

    })
}

function projectAlreadyExists(project){
    return document.querySelector(`li[data-id='${project.id}'`)
}

function disableFormSubmissionBtn(){
    [...document.querySelectorAll("button[id*='submit']")].forEach((btn) => btn.setAttribute("disabled", ""))
}

function formSubmissionHandler(e){
    createProjectObj()
    renderProjects()
    disableFormSubmissionBtn()
    resetCharCounters()
    e.currentTarget.reset()
    storage.saveProjectsArray(projectsArray)
}
document.querySelector("#project-dialog > form").addEventListener('submit', formSubmissionHandler)

export function initialRendering(){
    renderProjects()
}

// -------------------------------------

function getCurrentProject(){
    const currentPageId = document.querySelector("#project-page").dataset.id
    return projectsArray.find((project) => project.id === currentPageId)
}


function openTaskDialog(e){
    document.querySelector("#tasks-dialog form").reset()
    renderTaskForm(e)
    document.querySelector("#tasks-dialog").showModal()
}
document.querySelector("#task-add-btn").addEventListener("click", openTaskDialog)

function renderTaskForm(e){
    renderProjectSelection()
    selectCurrentProject()
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
    projectSelection.value = getCurrentProject().title
}

function selectDefaultDate(){
    const dateInput = document.querySelector("#task-due-date")
    Object.assign(dateInput, {
        min: format(new Date(), 'yyyy-MM-dd'),
        max: '2100-12-20',
        value: format((new Date()).setDate((new Date()).getDate() + 3),'yyyy-MM-dd') // set to after 3 days
    })
}

function adjustTaskSubmitBtnText(showDialogBtn){
    const submitBtn = document.querySelector("#task-dialog-submit-btn")
    showDialogBtn.id === "task-add-btn"? submitBtn.textContent = "Add" : submitBtn.textContent = "Save"
}



function addTask(){
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

function getAllTaskFormElements(){
    return [...document.querySelector("#tasks-dialog form").elements]
}


function createCardContainer(task){
    const taskCardContainer = dom.createTaskCardContainer(task)
    function taskContainerClickHandler(e){
        renderTaskForm(e)
        
        const tasksDialog = document.querySelector("#tasks-dialog")
        tasksDialog.showModal()

        const taskFormElements = getAllTaskFormElements()
        setupFormElementsValues(taskFormElements, task)
        updateFormSubmitBtnAvailability(taskFormElements.find(input => input.required))
        
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
    selectedProject.addTask(task)
    storage.saveProjectsArray(projectsArray)
}

function updateDisplayedTask(task){
    const taskTitle = document.querySelector(`.task-card[data-id='${task.id}'] .task-title`)
    const taskDueDate = document.querySelector(`.task-card[data-id='${task.id}'] .task-due-date`)

    taskTitle.textContent = task.title
    taskDueDate.textContent = intlFormatDistance(task.dueDate, new Date())
    displayPriority(task)
}

function displayPriority(task){
    const taskContainer = document.querySelector(`.task-card[data-id='${task.id}'`)
    switch(Number(task.priority)){
        case 4:
            taskContainer.style.borderColor = "hsl(0, 100%, 50%)"
            taskContainer.style.fontWeight = "700"
            break

        case 3:
            taskContainer.style.borderColor = "hsl(19, 100%, 70%)"
            taskContainer.style.fontWeight = "600"
            break

        case 2:
            taskContainer.style.borderColor = "hsl(55, 100%, 50%)"
            taskContainer.style.fontWeight = "500"
            break

        case 1:
            taskContainer.style.borderColor = "hsl(120, 100%,50%)"
            taskContainer.style.fontWeight = "400"
    }
}




function createCheckBtn(task){
    const checkBtn = dom.createCheckBtn()
    function checkBtnClickHandler(e){
        e.stopPropagation()
        task.toggleState()
        updateCheckBtn(task, e.currentTarget)
    }
    checkBtn.addEventListener("click", checkBtnClickHandler)

    return checkBtn
}

function updateCheckBtn(task, checkBtn){
    (task.isCompleted)? checkBtn.classList.add("checked") : checkBtn.classList.remove("checked")
}


function createTaskMainContent(task){
    const cardTitle = dom.createCardTitle(task)
    const cardDueDate = dom.createCardDueDate(task)
    return {cardTitle, cardDueDate}
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
            if (!subtasksLimitReached(task)) addInitialSubtasksList(taskCardContainer,task)
            renderTaskSubtasks(task)
            storage.saveTaskExpanded(task.id, true) 
        }else{
            clearList(taskCardContainer)
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

function clearList(card){
    const ul = card.querySelector(".subtasks-list")
    ul.replaceChildren()
}

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


function checkIfTaskIsExpanded(task){
    return JSON.parse(sessionStorage.getItem(task.id))
}

function formSubmitHandler(e){
    addTask()
    renderProjectTasks(getCurrentProject())
    e.currentTarget.reset()
    resetCharCounters()
    storage.saveProjectsArray(projectsArray)
}
document.querySelector("#tasks-dialog form").addEventListener("submit", formSubmitHandler)


function addInitialSubtasksList(currentTaskCard, task){
    const subtasksList = currentTaskCard.querySelector("ul") || dom.createSubtasksUL()
    subtasksList.addEventListener("click", (e)=> e.stopPropagation())
    const addBtnList = createAddSubtaskBtnList(task)

    subtasksList.appendChild(addBtnList)
    currentTaskCard.appendChild(subtasksList)
}



function createAddSubtaskBtnList(task){
    const subtasksListItem = dom.createAddBtnList()
    const addSubtaskBtn = subtasksListItem.querySelector("button")
    addSubtaskBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        const form = createSubtaskForm(task)       
        subtasksListItem.before(form)
        const input = form.querySelector("input")
        console.log(input)
        input.focus()
        input.addEventListener("input", (e) => updateCharCount(e.currentTarget))

        subtasksListItem.remove()
    })
    return subtasksListItem
}

function subtasksLimitReached(task){
    return task.subtasksArray.length === task.maxArrayLength
}

function getSubtasksList(childElem="", taskId=""){
    if (childElem) return childElem.closest("ul")
    if (taskId) return document.querySelector(`.task-card[data-id="${taskId}"] ul`)
}

function createDisplaySubtask(task, subtask){
    const checkBtn = createCheckBtn(subtask)
    const title = createSubtaskTitleInput(subtask.title)
    const delBtn = createSubTaskDelBtn(subtask, task)
    const listCard = createSubtaskCardContainer(subtask)
    const li = dom.createSubtaskLI()

    listCard.append(checkBtn, title, delBtn)
    li.append(listCard)
    
    return li
}

function createSubTaskDelBtn(subtask, task){
    const delBtn = dom.createCardDelBtn()
    delBtn.addEventListener("click", () =>{
        if (subtasksLimitReached(task)){
            getSubtasksList(delBtn).appendChild(createAddSubtaskBtnList(task))
        }

        const subtaskLi = document.querySelector(`li:has(.subtask-card[data-id="${subtask.id}"])`)
        subtaskLi.remove()    
        task.removeSubtask(subtask)
        storage.saveProjectsArray(projectsArray)
    })

    return delBtn
}

function createSubtaskObject(task, titleValue=""){
    const subtask = new Subtask(titleValue)
    task.addSubtask(subtask)
    return subtask
}

function createSubtaskTitleInput(subtaskTitle=""){
    const subtaskTitleInput = dom.createSubtaskTitleInput(subtaskTitle)
    subtaskTitleInput.addEventListener("dblclick", (e) =>{
        e.stopPropagation()
        subtaskTitleInput.removeAttribute("readOnly")
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
        const subtasksUl = getSubtasksList("", task.id)

        if (addSubtaskBtnExists(subtasksUl)){
            subtasksUl.querySelector("li:has(.add-subtask-btn)").before(displaySubtask)
        }else{
            subtasksUl.appendChild(displaySubtask)
        }

        subtasksUl.querySelector(`li:has(*[data-id="${subtask.id}"]) input`).value = subtask.title
        updateCheckBtn(subtask, subtasksUl.querySelector(`li:has(*[data-id="${subtask.id}"]) .task-check-btn`))
    })
}

function subtaskAlreadyDisplayed(subtask){
    return document.querySelector(`*[data-id="${subtask.id}"]`)
}

function addSubtaskBtnExists(ul){
    return ul.querySelector("li:has(.add-subtask-btn)")
}

function createSubtaskForm(task){
    const listItem = dom.createFormList()
    const subtaskForm = listItem.querySelector("form")
    const input = createSubtaskTitleInput()
    const cancelBtn = subtaskForm.querySelector(".subtask-cancel")

    subtaskForm.prepend(input)

    cancelBtn.addEventListener("click", (e)=>{
        e.currentTarget.closest("li").remove()

        if (!subtasksLimitReached(task)){    
            getSubtasksList("",task.id).append(createAddSubtaskBtnList(task))
        }
    })

    subtaskForm.addEventListener("submit", (e) =>{
        e.preventDefault()
        createSubtaskObject(task, input.value.trim())
        renderTaskSubtasks(task)
        e.currentTarget.reset()
        cancelBtn.click()
        storage.saveProjectsArray(projectsArray)
    })

    return listItem
}
