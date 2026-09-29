import delIcon  from "./assets/close.svg"
import circleIcon from "./assets/circle-outline.svg"
import expandIcon from "./assets/chevron-down.svg"

import { projectsContainer } from "./projectsContainer.js"
import { createProject } from "./createProject.js"
import { createTask } from "./createTask.js"

import {toCamelCase, replaceEventListener, createDOMElement} from "./helper.js"
import { intlFormatDistance } from "date-fns";
import { format } from "date-fns"


export const displayProjects = (() =>{
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
        displayTasks.renderProjectTasks(project)
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


    function initialRendering(){
        renderProjects()
        updateProjectsNumCounter()
        updateProjectAddBtnAvailability()
    }

    return {initialRendering, renderProjectPage}
})()



export const displayTasks = (() =>{
    const projectsArray = projectsContainer.getProjectsArray()
        
    // renders the projects selection option depending on all the current project
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
            const projectOption = document.createElement("option")
            projectOption.value = projectOption.textContent = project.title
            projectOption.dataset.id = project.getId()
        

            projectSelection.appendChild(projectOption)
        })
    }

    // gets the current project page
    function getCurrentProject(){
        return projectsArray.find((project) => project.getId() === document.querySelector("#project-page").dataset.id)
    }

    // selects the current project in the selection form element
    function selectCurrentProject(){
        document.querySelector("#task-project").value = getCurrentProject().title
    }

    // adjust the text of task dialog submit btn depending on the caller
    function adjustTaskSubmitBtnText(e){
        const submitBtn = document.querySelector("#task-dialog-submit-btn")
        e.currentTarget.id === "task-add-btn"? submitBtn.textContent = "Add" : submitBtn.textContent = "Save"
    }

    function selectDefaultDate(){
        const dateInput = document.querySelector("#task-due-date")
        Object.assign(dateInput, {
            min: format(new Date(), 'yyyy-MM-dd'),
            max: '2100-12-20',
            value: format((new Date()).setDate((new Date()).getDate() + 3),'yyyy-MM-dd') // set to after 3 days
        })
    }

    // 1-renders project selection form elem, 2-selects the current project, 3-adjusts text of dialog submit btn, 4- opens the dialog
    function openTaskDialog(e){
        document.querySelector("#tasks-dialog form").reset()
        renderProjectSelection()
        selectCurrentProject()
        selectDefaultDate()
        adjustTaskSubmitBtnText(e)
        document.querySelector("#tasks-dialog").showModal()
    }
    document.querySelector("#task-add-btn").addEventListener("click", openTaskDialog)

    // updates the content of the task card after edit
    function updateDisplayedTask(task){
        document.querySelector(`.task-card[data-id='${task.getId()}'] .task-title`).textContent = task.title
        document.querySelector(`.task-card[data-id='${task.getId()}'] .task-due-date`).textContent = intlFormatDistance(task.dueDate, new Date())

        displayPriority(task)
    }

    // changes the color of the border depending on the priority level
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

    function updateCheckBtn(task, checkBtn){
        (task.completed())? checkBtn.classList.add("checked") : checkBtn.classList.remove("checked")
    }

    // gets all tasks form elements
    function getAllTaskFormElements(){
        return Array.from(document.querySelectorAll("#tasks-dialog form input, #tasks-dialog form select"))
    }

    // creates a task and appends it to the correct project
    function addTask(){
        const taskFormElements = getAllTaskFormElements()

        const task = createTask(taskFormElements[0].value.trim(), taskFormElements[1].value.trim(), taskFormElements[2].value, taskFormElements[3].value, taskFormElements[4].selectedIndex - 1)
        
        projectsArray[task.parentProjectIdx].addTask(task)

        return task
    }

    // creates the card container and sets it's click listener
    function createCardContainer(task){
        const taskCardContainer = document.createElement("div")
        taskCardContainer.classList.add("task-card")
        taskCardContainer.dataset.id = task.getId()
        
        function taskContainerClickHandler(e){
            const tasksDialog = document.querySelector("#tasks-dialog")
            tasksDialog.showModal()
            
            // adjust the submit btn
            const saveBtn = document.querySelector("#task-dialog-submit-btn")
            adjustTaskSubmitBtnText(e)
            
            // setting the values of inputs
            const taskFormElements = getAllTaskFormElements()
            taskFormElements.forEach(formElement => {
                (formElement.id == "task-project")? formElement.value = `${getCurrentProject().title}` : formElement.value = task[`${helper.toCamelCase(formElement.id, 1)}`]
            }) 

            // updates the task and it's display card
            function saveBtnHandler(e){
                e.preventDefault()

                taskFormElements.forEach(formElement => {
                    (formElement.id == "task-project")? selectCurrentProject(e) : task[`${helper.toCamelCase(formElement.id, 1)}`] = formElement.value 
                }) 
                updateDisplayedTask(task)
                renderProjectTasks(getCurrentProject())

                document.querySelector("#tasks-dialog form").reset()
                tasksDialog.close()
            }
            saveBtn.addEventListener("click", saveBtnHandler, {once:true}) // setting once to avoid duplicate listeners

            document.querySelector(".task-close-btn").addEventListener("click", () =>{
                tasksDialog.close()
                saveBtn.removeEventListener("click", saveBtnHandler)
            }, {once:true})
        }
        taskCardContainer.addEventListener("click", taskContainerClickHandler)


        return taskCardContainer
    }

    // create check btn and sets it's click listener
    function createCheckBtn(task){
        const checkBtn = document.createElement("button"),
        checkBtnImg = document.createElement("img")
        checkBtn.classList.add("task-check-btn")
        checkBtnImg.src = circleIcon
        checkBtnImg.height = checkBtnImg.width = "35"
        checkBtn.appendChild(checkBtnImg)

        function checkBtnClickHandler(e){
            e.stopPropagation()

            task.toggleState();
            updateCheckBtn(task, e.currentTarget)

        }
        checkBtn.addEventListener("click", checkBtnClickHandler)
        

        return checkBtn
    }

    // creates both the task card title and due date
    function createTaskMainContent(task){
        const cardTaskTitle = document.createElement("div"),
            cardTaskDueDate = document.createElement("div")
        cardTaskTitle.classList.add("task-title")
        cardTaskDueDate.classList.add("task-due-date")
        cardTaskTitle.textContent = task.title
        cardTaskDueDate.textContent = intlFormatDistance(task.dueDate, new Date())

        return {cardTaskTitle, cardTaskDueDate}
    }

    // creates the task del btn and add it's click listener
    function createTaskDelBtn(task){
        const delBtn = document.createElement("button"),
            delBtnImg = document.createElement("img")
        delBtn.classList.add("task-del-btn")
        delBtnImg.src = delIcon
        delBtnImg.height = delBtnImg.width = 20
        delBtn.appendChild(delBtnImg)

        // removes the card from the projects and from the display
        function delBtnClickHandler(e){
            e.stopPropagation()
            projectsArray[task.parentProjectIdx].removeTask(task)
            e.target.closest(".task-card").remove()

        }
        delBtn.addEventListener("click", delBtnClickHandler )

        return delBtn
    }

    // creates the card expand btn
    function createExpandBtn(){
        const expandBtn = document.createElement("button"),
            expandBtnImg = document.createElement("img")

        expandBtn.classList.add("task-expand-btn")
        expandBtnImg.src = expandIcon
        expandBtnImg.height = expandBtnImg.width = 20
        expandBtn.appendChild(expandBtnImg)

        return expandBtn
    }

    // renders the task after form submission
    function renderProjectTasks(project){
        if (!project) return
        project.getAllTasks().forEach((task) => {
            if (document.querySelector(`*[data-id='${task.getId()}'`)) return

            const taskCardContainer = createCardContainer(task),
                  taskCheckBtn = createCheckBtn(task),
                  taskTitle = createTaskMainContent(task).cardTaskTitle,
                  taskDueDate = createTaskMainContent(task).cardTaskDueDate,
                  taskDelBtn = createTaskDelBtn(task),
                  taskExpandBtn = createExpandBtn()

            taskCardContainer.append(taskCheckBtn, taskTitle, taskDueDate, taskDelBtn, taskExpandBtn)
            const cardsContainer = document.querySelector("#cards-container")
            cardsContainer.appendChild(taskCardContainer)
            document.querySelector("#project-page .wrapper").appendChild(cardsContainer)
            displayPriority(task)
            console.log(task.completed())
            updateCheckBtn(task, taskCheckBtn)
        })
    }

    function formSubmitHandler(e){
        addTask()
        renderProjectTasks(getCurrentProject())
        e.currentTarget.reset()
    }

    document.querySelector("#tasks-dialog form").addEventListener("submit", formSubmitHandler)

    function initialRendering(){
        if (projectsArray.length === 0) return
        addAllSavedTasks()
        displayProjects.renderProjectPage(getCurrentProject())
    }

    return {initialRendering, renderProjectTasks, getCurrentProject}
})()