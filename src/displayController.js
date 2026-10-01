import delIcon  from "./assets/close.svg"
import circleIcon from "./assets/circle-outline.svg"
import expandIcon from "./assets/chevron-down.svg"

import { projectsContainer } from "./projectsContainer.js"
import { createProject } from "./createProject.js"
import { createTask } from "./createTask.js"

import {toCamelCase, replaceEventListener, createDOMElement} from "./helper.js"
import { intlFormatDistance } from "date-fns";
import { format } from "date-fns"
import { createSubtask } from "./createSubtask.js"


const projectsArray = projectsContainer.getProjectsArray()
const projectsArrayMaxLength = projectsContainer.getMaxArrayLength()



function toggleSidebar(e){
    const sidebar = document.querySelector("#sidebar")
    const projectPage = document.querySelector("#project-page");
    
    [e.currentTarget, sidebar, projectPage].forEach(sidebarTransitionElem => sidebarTransitionElem.classList.toggle("sidebar-close"))
}
document.querySelector("#sidebar-toggling-btn").addEventListener("click", toggleSidebar)



function updateProjectsNumCounter(){ 
    const projectsNumCounter = document.querySelector("#projects-counter")

    updateProjectsCounterText(projectsNumCounter)
    updateProjectsCounterColor(projectsNumCounter)
}

function updateProjectsCounterText(projectsNumCounter){
    projectsNumCounter.textContent = `${projectsArray.length} / ${projectsArrayMaxLength}`;
}

function updateProjectsCounterColor(projectsNumCounter){
    if (projectsArray.length === projectsArrayMaxLength){
        projectsNumCounter.style.color = "red"

    }else if (projectsArray.length >= projectsArrayMaxLength / 2){
        projectsNumCounter.style.color = "orange"

    }else{
        projectsNumCounter.style.color = "green"
    }
}



function inputsEventHandler(e){
    const currentInput = e.currentTarget

    if (inputIsATitleInput(currentInput)){
        validateTitleInput(currentInput)
    }

    if (inputIsRequired(currentInput)){
        updateFormSubmitBtnAvailability(currentInput)
    }

    updateCharCount(currentInput)
}

function inputIsATitleInput(input){
    return input.name.includes("project-title")
}

function validateTitleInput(titleInput){
    if (projectTitleExists(titleInput)){
        titleInput.setCustomValidity("Project already exists")

    }else{
        titleInput.setCustomValidity("")
    }
}

function projectTitleExists(titleInput){
    return projectsArray.some(project => project.title === titleInput.value)
}

function inputIsRequired(input){
    return input.hasAttribute("required")
}

function updateFormSubmitBtnAvailability(requiredInput){
    const activeFormDialog = requiredInput.closest("dialog")
    const formSubmitBtn = document.querySelector(`#${activeFormDialog.id} button[id*="submit"]`);

    (requiredInput.checkValidity())? formSubmitBtn.removeAttribute("disabled") : formSubmitBtn.setAttribute("disabled","")
}

function updateCharCount(textInput){
    const charCounter = document.querySelector(`#${textInput.id} + .char-counter`)

    charCounter.textContent = `${textInput.value.length} / ${textInput.maxLength}`
}



function openDialog(){
    document.querySelector("#project-dialog").showModal()
    addInputEventToTextInputs()
}

function addInputEventToTextInputs(){
    Array.from(document.querySelectorAll("input[type='text']")).forEach((input) => replaceEventListener(input, "input", inputsEventHandler))
}

document.querySelector("#sidebar-add-project-btn").addEventListener("click", openDialog)



function addProject(){
    const projectTitleInput = document.querySelector("#project-title")
    const projectDescriptionInput = document.querySelector("#project-description")

    const project = createProject(projectTitleInput.value.trim(), projectDescriptionInput.value.trim())
    projectsContainer.addProjectToArray(project)
    updateProjectPageId(project)

    return project
}

function updateProjectPageId(project){
    document.querySelector("#project-page").dataset.id = project.getId()
}



function createProjectSidebarList(project){
    const projectListItem = createDOMElement({elemType:"li", dataId:project.getId()})
    const projectListTitle = createDOMElement({elemType:"div", textContent:project.title, className:"project-title"})

    return {projectListItem, projectListTitle}
}



function createRemoveProjectBtn(project){
    const removeProjectBtn = createDOMElement({elemType:"button", className:"project-remove-btn"})
    const removeBtnImg = createDOMElement({elemType:"img", src:delIcon, height:"15"})
    removeProjectBtn.appendChild(removeBtnImg)

    function removeBtnClickHandler(e){
        e.stopPropagation();

        const indexOfProject = projectsArray.indexOf(project)
        const prevOrNextProject = projectsArray[indexOfProject - 1] || projectsArray[indexOfProject + 1];  

        getProjectSidebarList(project).remove()
        projectsContainer.removeProjectFromArray(project)

        updateProjectsNumCounter()
        updateProjectAddBtnAvailability();

        // if the length of array after project removal = 0 clear the main page otherwise click the prevOrNextProject
        if(projectsArray.length === 0){
            clearProjectPage() 

        }else{   
            const prevOrNextProjectPageLoader = document.querySelector(`li[data-id="${prevOrNextProject.getId()}"] .project-page-loader`) 
            prevOrNextProjectPageLoader.click()
        }
    }
    removeProjectBtn.addEventListener("click", removeBtnClickHandler)

    return removeProjectBtn
}

function getProjectSidebarList(project){
    return document.querySelector(`li[data-id="${project.getId()}"]`)
}

function updateProjectAddBtnAvailability(){ 
    const projectAddBtn = document.querySelector("#sidebar-add-project-btn")

    if (projectsArray.length === projectsArrayMaxLength){
        projectAddBtn.classList = "disable"
        projectAddBtn.style.color = "red"

    }else{
        projectAddBtn.classList.remove("disable")
        projectAddBtn.style.color = "green"
    }
}

function clearProjectPage(){
    Array.from(document.querySelectorAll("#project-page .wrapper > div")).forEach(container => container.replaceChildren())
}



function renderProjectPage(project){
    clearProjectPage()
    renderProjectTasks(project)
    updateProjectPageId(project)
    renderProjectInputs(project)

}

function renderProjectInputs(project){
    const projectPageTitleInput = createDOMElement({elemType:"input", value:project.title})
    Object.assign(projectPageTitleInput, {
        type: "text",
        name: "project-title",
        id: "project-page-title",
        placeholder: "Title",
        minLength: "2",
        maxLength: "50",
        pattern: "^\S{1,}.*",
        readOnly: true,
    })

    const titleCharCounter = createDOMElement({elemType:"span", className:"char-counter"})
    const titleNote = createDOMElement({elemType:"span", className:"note", textContent:"Double click to edit"})

    document.querySelector("#project-page .title-container").append(projectPageTitleInput, titleCharCounter, titleNote)

    const projectPageDescriptionInput = createDOMElement({elemType:"input", value:project.description})
    Object.assign(projectPageDescriptionInput, {
        type: "text",
        name: "project-description",
        id: "project-page-description",
        autocorrect: "on",
        placeholder: "Description",
        maxLength: "80",
        readOnly: true,
    })

    const descCharCounter = createDOMElement({elemType:"span", className:"char-counter"})
    const descNote = createDOMElement({elemType:"span", className:"note", textContent:"Double click to edit"})

    document.querySelector("#project-page .description-container").append(projectPageDescriptionInput, descCharCounter, descNote)

    // inputs events
    function inputsDoubleClickHandler(e){
        const projectPageInput = e.currentTarget
        projectPageInput.removeAttribute("readonly")
    }

    function inputChangeEventHandler(e){
        const projectPageInput = e.currentTarget

        projectPageInput.setAttribute("readonly", "")

        const lastWordOfInputName = projectPageInput.name.split("-").at(-1) // either title or description
        project[lastWordOfInputName] = projectPageInput.value.trim() 

        updateProjectListTitle(project)

        document.querySelector(`#${projectPageInput.id} + .char-counter`).textContent = ""
    }

    [projectPageTitleInput, projectPageDescriptionInput].forEach((projectPageInput) =>{
        projectPageInput.addEventListener("dblclick", inputsDoubleClickHandler)
        projectPageInput.addEventListener("change", inputChangeEventHandler)
    })
    addInputEventToTextInputs() 
}

function updateProjectListTitle(project){
    document.querySelector(`li[data-id="${project.getId()}"] .project-title`).textContent = project.title
}

function createProjectPageLoader(project){
    const projectPageLoader = createDOMElement({elemType:"button", className:"project-page-loader"})
    projectPageLoader.addEventListener("click", () => renderProjectPage(project))
    projectPageLoader.click()
    
    return projectPageLoader
}



function renderProjects(){
    if (projectsArray.length > projectsArrayMaxLength) return
    projectsArray.forEach(project =>{
        if (projectAlreadyExists(project)) return

        const projectListItem = createProjectSidebarList(project).projectListItem
        const projectListTitle = createProjectSidebarList(project).projectListTitle
        const removeProjectBtn = createRemoveProjectBtn(project)
        const projectPageLoader = createProjectPageLoader(project)
        
        projectPageLoader.append(projectListTitle, removeProjectBtn)
        projectListItem.append(projectPageLoader)
        document.querySelector("#projects-list").appendChild(projectListItem)

    })
}

function projectAlreadyExists(project){
    return document.querySelector(`li[data-id='${project.getId()}'`)
}



function formSubmissionHandler(e){
    addProject()
    renderProjects()
    e.currentTarget.reset()
    updateProjectsNumCounter()
    updateProjectAddBtnAvailability()
    disableFormSubmissionBtn()
}

function disableFormSubmissionBtn(){
    Array.from(document.querySelectorAll("button[id*='submit']")).forEach((btn) => btn.setAttribute("disabled", ""))
}

document.querySelector("#project-dialog > form").addEventListener('submit', formSubmissionHandler)


export function initialRendering(){
    renderProjects()
    updateProjectsNumCounter()
    updateProjectAddBtnAvailability()
}

// -------------------------------------

function getCurrentProject(){
    const currentPageId = document.querySelector("#project-page").dataset.id
    return projectsArray.find((project) => project.getId() === currentPageId)
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
    projectSelection.replaceChildren() // clear all children

    const initialSelection = document.createElement('option')
    Object.assign(initialSelection, {
        textContent: "Project",
        disabled: true,
        selected: true,
        hidden: true,
        value: "",
    })
    projectSelection.appendChild(initialSelection)

    projectsArray.forEach((project) =>{
        const projectOption = createDOMElement({elemType:"option", textContent:project.title, dataId:project.getId()})
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

    const task = createTask(titleValue, descriptionValue, dueDateValue, priorityValue)
    projectsArray[selectedProjectIdx].addTask(task)

    return task
}

function getAllTaskFormElements(){
    return Array.from(document.querySelectorAll("#tasks-dialog form input, #tasks-dialog form select"))
}


function createCardContainer(task){
    const taskCardContainer = createDOMElement({elemType:"div", className:"task-card", dataId:task.getId()})
    
    function taskContainerClickHandler(e){
        renderTaskForm(e)
        
        const tasksDialog = document.querySelector("#tasks-dialog")
        tasksDialog.showModal()


        const saveBtn = document.querySelector("#task-dialog-submit-btn")
        
        const taskFormElements = getAllTaskFormElements()
        setupFormElementsValues(taskFormElements, task)

        function saveBtnHandler(e){
            e.preventDefault()

            updateTaskObjectValues(taskFormElements, task)
            updateDisplayedTask(task)
            renderProjectPage(getCurrentProject())

            document.querySelector("#tasks-dialog form").reset()
            tasksDialog.close()
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
}

function updateDisplayedTask(task){
    const taskTitle = document.querySelector(`.task-card[data-id='${task.getId()}'] .task-title`)
    const taskDueDate = document.querySelector(`.task-card[data-id='${task.getId()}'] .task-due-date`)

    taskTitle.textContent = task.title
    taskDueDate.textContent = intlFormatDistance(task.dueDate, new Date())
    displayPriority(task)
}

function displayPriority(task){
    const taskContainer = document.querySelector(`.task-card[data-id='${task.getId()}'`)
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
    const checkBtn = createDOMElement({elemType:"button", className:"task-check-btn"})
    const checkBtnImg = createDOMElement({elemType:"img", src:circleIcon, height:"35"})
    checkBtn.appendChild(checkBtnImg)

    function checkBtnClickHandler(e){
        e.stopPropagation()

        task.toggleState();
        updateCheckBtn(task, e.currentTarget)

    }
    checkBtn.addEventListener("click", checkBtnClickHandler)
    

    return checkBtn
}

function updateCheckBtn(task, checkBtn){
    (task.completed())? checkBtn.classList.add("checked") : checkBtn.classList.remove("checked")
}



function createTaskMainContent(task){
    const cardTaskTitle = createCardTitleDOMElem(task)
    const cardTaskDueDate = createDOMElement({elemType:"div", className:"task-due-date", textContent:intlFormatDistance(task.dueDate, new Date())})

    return {cardTaskTitle, cardTaskDueDate}
}

function createCardTitleDOMElem(task){
    const cardTaskTitle = createDOMElement({elemType:"div", className:"task-title", textContent:task.title})
    return cardTaskTitle
}


function createTaskDelBtn(task){
    const delBtn = createDelBtnDOMElem()

    function delBtnClickHandler(e){
        e.stopPropagation()
        getCurrentProject().removeTask(task)
        e.target.closest(".task-card").remove()

    }
    delBtn.addEventListener("click", delBtnClickHandler )

    return delBtn
}

function createDelBtnDOMElem(){
    const delBtn = createDOMElement({elemType:"button", className:"task-del-btn"})
    const delBtnImg = createDOMElement({elemType:"img", src:delIcon, height:"20"})
    delBtn.appendChild(delBtnImg)

    return delBtn
}



function createExpandBtn(task){
    const expandBtn = createDOMElement({elemType:"button", className:"task-expand-btn"})
    const expandBtnImg = createDOMElement({elemType:"img", src:expandIcon, height:"20"})
    expandBtn.appendChild(expandBtnImg)

    function expandBtnClickHandler(e){
        e.stopPropagation()
        const taskCardContainer = expandBtn.closest(".task-card")
        toggleCardExpandedClass(taskCardContainer)

        if (isExpanded(taskCardContainer)){
            addInitialSubtasksList(taskCardContainer)

        }else{
            clearList(taskCardContainer)
        }
    }
    expandBtn.addEventListener("click", expandBtnClickHandler)

    return expandBtn
}

function toggleCardExpandedClass(card){
    card.classList.toggle("expanded")
}

function isExpanded(card){
    return card.classList.contains("expanded")
}

function clearList(card){
    const list = document.querySelector(`.task-card[data-id="${card.dataset.id}"] .subtasks-list`)
    list.remove()
}

function renderProjectTasks(project){
    if (!project) return
    project.getAllTasks().forEach((task) => {
        if (taskAlreadyDisplayed(task)) return

        const taskCardContainer = createCardContainer(task)
        const taskCheckBtn = createCheckBtn(task)
        const taskTitle = createTaskMainContent(task).cardTaskTitle
        const taskDueDate = createTaskMainContent(task).cardTaskDueDate
        const taskDelBtn = createTaskDelBtn(task)
        const taskExpandBtn = createExpandBtn(task)
        const cardsContainer = document.querySelector("#cards-container")
        const projectPage = document.querySelector("#project-page .wrapper")

        taskCardContainer.append(taskCheckBtn, taskTitle, taskDueDate, taskDelBtn, taskExpandBtn)
        cardsContainer.appendChild(taskCardContainer)
        projectPage.appendChild(cardsContainer)
        displayPriority(task)
        updateCheckBtn(task, taskCheckBtn)
    })
}

function taskAlreadyDisplayed(task){
    return document.querySelector(`*[data-id='${task.getId()}'`)
}


function formSubmitHandler(e){
    addTask()
    renderProjectTasks(getCurrentProject())
    e.currentTarget.reset()
}

document.querySelector("#tasks-dialog form").addEventListener("submit", formSubmitHandler)

// function initialRendering(){
//     if (projectsArray.length === 0) return
//     addAllSavedTasks()
//     displayProjects.renderProjectPage(getCurrentProject())
// }


// ---------------------------------------

function addInitialSubtasksList(currentTaskCard){
    const subtasksList = createSubtasksList()
    const subtasksListItem = createASubtaskListItem()
    const subtaskContainer = createSubtaskContainer()
    const addSubtaskBtn = createAddSubtaskBtn(currentTaskCard)

    subtasksList.appendChild(subtasksListItem)
    subtasksListItem.appendChild(subtaskContainer)
    subtaskContainer.appendChild(addSubtaskBtn)

    currentTaskCard.appendChild(subtasksList)
}

function createSubtasksList(){
    const subtasksList = createDOMElement({elemType:"ul", className:"subtasks-list"})
    return subtasksList
}

function createASubtaskListItem(){
    const subtasksListItem = createDOMElement({elemType:"li", className:"subtask-list-item"})
    return subtasksListItem
}

function createSubtaskContainer(){
    const subtaskContainer = createDOMElement({elemType:"div", className:"subtask-container"})
    return subtaskContainer
}

function createAddSubtaskBtn(currentTaskCard){
    const addSubtaskBtn = createDOMElement({elemType:"button", className:"add-subtask-btn", textContent:"+"})

    addSubtaskBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        const subtaskList = addSubtaskList(currentTaskCard)

        e.currentTarget.closest("ul").appendChild(subtaskList)

    })
    return addSubtaskBtn
}


function addSubtaskList(currentTaskCard){
    const subtask = createSubtask("antything")
    const checkBtn = createCheckBtn(subtask)
    const title = createCardTitleDOMElem(subtask)
    const delBtn = createDelBtnDOMElem()
    const listCard = createCardContainer(subtask)
    const li = createASubtaskListItem()
    listCard.append(checkBtn, title, delBtn)
    listCard.classList.add("subtask-card")
    li.append(listCard)

    return li
}