import delIcon  from "./assets/close.svg"
import circleIcon from "./assets/circle-outline.svg"
import expandIcon from "./assets/chevron-down.svg"

import { projectsContainer } from "./projectsContainer.js"
import { createProject } from "./createProject.js"
import { createTask } from "./createTask.js"

import * as helper from "./helper.js"
import { intlFormatDistance } from "date-fns";
import { format } from "date-fns"


export const displayProjects = (() =>{
    const projectsArray = projectsContainer.getProjectsArray()


    // Closing and opening sidebar
    function toggleSidebar(e){
        e.currentTarget.classList.toggle("sidebar-close")
        document.querySelector("#sidebar").classList.toggle("sidebar-close")
        document.querySelector("#main").classList.toggle("sidebar-close")
    }
    document.querySelector("#sidebar-toggling-btn").addEventListener("click", toggleSidebar)


    // updating the color of the counter depending on the current amount of projects
    function updateProjectsCounter(){ 
        const projectsCounter = document.querySelector("#projects-counter")

        projectsCounter.textContent = `${projectsArray.length} / ${projectsContainer.getMaxLength()}` // current number of projects / max number of projects
        
        projectsArray.length <= projectsContainer.getMaxLength() / 2? projectsCounter.classList = "low" : projectsCounter.classList = "mid"
        if(projectsArray.length == projectsContainer.getMaxLength()) projectsCounter.classList = "max"
    }

    // disable or enable the dialog button depending on the current remaining projects slots
    function updateShowDialogBtn(){ 
        const showDialogBtn = document.querySelector("#project-dialog-show-btn")

        if (projectsArray.length == projectsContainer.getMaxLength()){
            showDialogBtn.classList = "disable"
            showDialogBtn.style.color = "red"
        }else{
            showDialogBtn.classList.remove("disable")
            showDialogBtn.style.color = ""
            
        }
    }

    function checkProjectTitle(e){
        return projectsArray.some(project => project.title === e.target.value)
    }

    // Updates the form submission btn depending on the input if it's valid or not
    function updateFormSubmissionBtn(e){
        const formSubmissionBtn = document.querySelector(`#${e.target.closest("dialog").id} button[id*='submit']`) // gets the inputs's parent dialog and from there gets the btn
        e.currentTarget.checkValidity()? formSubmissionBtn.removeAttribute("disabled") : formSubmissionBtn.setAttribute("disabled","")
    }

    // Display the current number of characters in the form inputs 
    function updateCharCount(e){
        const charCounter = document.querySelector(`#${e.target.id} + .char-counter`)
        charCounter.textContent = `${e.target.value.length} / ${e.target.maxLength}`
    }

    // Updates the project form submission btn & char count
    function projectTitleInputHandler(e){
        if(checkProjectTitle(e)){
           e.currentTarget.setCustomValidity("Project already exists")
        }else{
            e.currentTarget.setCustomValidity("")
        }
    }

    function requiredInputHandler(e){
        updateFormSubmissionBtn(e)
        updateCharCount(e)
    }

    function addEventsToInputs(){
        // preventing duplicate events
        Array.from(document.querySelectorAll("input[name='project-title']")).forEach((titleInput) => titleInput.removeEventListener("input", projectTitleInputHandler))
        Array.from(document.querySelectorAll("input[type='text']:required")).forEach((input) => input.removeEventListener("input", requiredInputHandler))
        Array.from(document.querySelectorAll("input[type='text']:not(:required)")).forEach((input) => input.removeEventListener("input", updateCharCount))
        
        Array.from(document.querySelectorAll("input[name='project-title']")).forEach((titleInput) => titleInput.addEventListener("input", projectTitleInputHandler))
        Array.from(document.querySelectorAll("input[type='text']:required")).forEach((input) => input.addEventListener("input", requiredInputHandler))
        Array.from(document.querySelectorAll("input[type='text']:not(:required)")).forEach((input) => input.addEventListener("input", updateCharCount))
    }

    // Opens the dialog
    function openDialog(){
        document.querySelector("#project-dialog").showModal()
        addEventsToInputs()
    }
    document.querySelector("#project-dialog-show-btn").addEventListener("click", openDialog)

    // disables all form submission btns
    function disableFormSubmissionBtn(){
        Array.from(document.querySelectorAll("button[id*='submit']")).forEach((btn) => btn.setAttribute("disabled", ""))
    }

    // removes the inputs on the main page
    function clearMainPage(){
        Array.from(document.querySelectorAll("#main .wrapper > div")).forEach(container => container.replaceChildren())
    }

    // updates the title on the li 
    function updateProjectListTitle(project){
        document.querySelector(`li[data-id="${project.getId()}"] .project-title`).textContent = project.title
    }

    // gets the current li depending on the current project id
    function getCurrentList(project){
        return document.querySelector(`li[data-id="${project.getId()}"]`)
    }

    // updates the main dataset id depending on the current project id
    function updateMainId(project){
        document.querySelector("#main").dataset.id = project.getId()
    }
    
    // adds a project depending on the project dialog inputs
    function addProject(){
        const projectTitleInput = document.querySelector("#project-title"),
              projectDescriptionInput = document.querySelector("#project-description")

        const project = createProject(projectTitleInput.value.trim(), projectDescriptionInput.value.trim())
        projectsContainer.addProject(project)
        updateMainId(project)

        return project
    }
    
    // creates the navbar project list
    function createProjectList(project){
        const projectListItem = document.createElement("li")
        projectListItem.dataset.id = project.getId()

        const projectListTitle = document.createElement("div")
        projectListTitle.textContent = project.title
        projectListTitle.classList.add("project-title")


        return {projectListItem, projectListTitle}
    }

    // creates the remove project and attaches it's click handler
    function createRemoveProjectBtn(project){
        const removeProjectBtn = document.createElement("button")
        removeProjectBtn.classList.add('project-remove-btn')

        const removeBtnImg = document.createElement("img")
        removeBtnImg.src = delIcon
        removeBtnImg.height = removeBtnImg.width = "15"

        removeProjectBtn.appendChild(removeBtnImg)
    
        function removeBtnClickHandler(e){
            e.stopPropagation();
            const prevOrNextProject = projectsArray[projectsArray.indexOf(project) - 1] || projectsArray[projectsArray.indexOf(project) + 1];// get the prev project or the next one if the prev is not found     

            getCurrentList(project).remove()
            projectsContainer.removeProject(project)
            updateProjectsCounter()
            updateShowDialogBtn()
            

            // if the length of array after project removal = 0 clear the main page otherwise click the prevOrNextProject
            projectsArray.length === 0? clearMainPage() : document.querySelector(`li[data-id="${prevOrNextProject.getId()}"] .list-items-container`).click();
        }
        removeProjectBtn.addEventListener("click", removeBtnClickHandler)

        return removeProjectBtn
    }

    // renders the title and description inputs in the project main page
    function renderProjectInputs(project){
        // Creating the main inputs
        const projectPageTitle = document.createElement("input")
        Object.assign(projectPageTitle, {
            type: "text",
            name: "project-title",
            id: "project-page-title",
            placeholder: "Title",
            minLength: "2",
            maxLength: "50",
            pattern: "^\S{1,}.*",
            readOnly: true,
        })
        const titleCharCounter = document.createElement("span")
        titleCharCounter.classList.add("char-counter")
        const titleNote = document.createElement("span")
        titleNote.classList.add("note")


        document.querySelector("#main .title-container").append(projectPageTitle, titleCharCounter, titleNote)

        const projectPageDescription = document.createElement("input")
        Object.assign(projectPageDescription, {
            type: "text",
            name: "project-description",
            id: "project-page-description",
            autocorrect: "on",
            placeholder: "Description",
            maxLength: "80",
            readOnly: true,
        })
        const descCharCounter = document.createElement("span")
        descCharCounter.classList.add("char-counter")
        const descNote = document.createElement("span")
        descNote.classList.add("note")

        document.querySelector("#main .description-container").append(projectPageDescription, descCharCounter, descNote)

        // inputs events
        function inputsDoubleClickHandler(e){
            e.target.removeAttribute("readonly")
        }

        function inputChangeEventHandler(e){
            document.querySelector(`#${e.target.id} + .char-counter`).textContent = ""
            e.target.setAttribute("readonly", "")
            
            projectsArray[0].title = e.target.value.trim() // takes the last word of the input's name (title or description)
            console.log(projectsArray)
            
            
            updateProjectListTitle(project)
        }

        [projectPageTitle, projectPageDescription].forEach((input) =>{
            input.addEventListener("dblclick", inputsDoubleClickHandler)
            input.addEventListener("change", inputChangeEventHandler)
        })

        addEventsToInputs() // add input event to the newly created input and input

        projectPageTitle.value = project.title
        projectPageDescription.value = project.description

        Array.from(document.querySelectorAll("#main .note")).forEach((note) => note.textContent = "Double click to edit")
    }

    // Displays the project title and description in the project main page
    function renderProjectMainPage(project){
        clearMainPage()
        displayTasks.renderProjectTasks(project)
        updateMainId(project)
        renderProjectInputs(project)

    }

    // creates the btn container for the navbar list items
    function createListItemsBtnContainer(project){
        const listItemsBtnContainer = document.createElement("button")
        listItemsBtnContainer.classList.add("list-items-container")
        listItemsBtnContainer.addEventListener("click", () => renderProjectMainPage(project))
        listItemsBtnContainer.click()
        
        return listItemsBtnContainer
    }

    // Adding Projects
    function renderProjects(){
        if (projectsArray.length >= projectsContainer.getMaxLength()) return // if the projectsContainer's max limit of projects is reached
        projectsArray.forEach(project =>{
            if (document.querySelector(`li[data-id='${project.getId()}'`)) return

            const projectListItem = createProjectList(project).projectListItem,
                  projectListTitle = createProjectList(project).projectListTitle,
                  removeProjectBtn = createRemoveProjectBtn(project),
                  listItemsBtnContainer = createListItemsBtnContainer(project)
            
            listItemsBtnContainer.append(projectListTitle, removeProjectBtn)
            projectListItem.append(listItemsBtnContainer)
            document.querySelector("#projects-list").appendChild(projectListItem)

        })
    }

    function formSubmissionHandler(e){
        addProject()
        renderProjects()
        e.currentTarget.reset()
        updateProjectsCounter()
        updateShowDialogBtn()
        disableFormSubmissionBtn()
    }
    document.querySelector("#project-dialog > form").addEventListener('submit', formSubmissionHandler)

    function initialRendering(){
        renderProjects()
        updateProjectsCounter()
        updateShowDialogBtn()
    }

    return {initialRendering, renderProjectMainPage}
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
        return projectsArray.find((project) => project.getId() === document.querySelector("#main").dataset.id)
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
            document.querySelector("#main .wrapper").appendChild(cardsContainer)
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
        displayProjects.renderProjectMainPage(getCurrentProject())
    }

    return {initialRendering, renderProjectTasks, getCurrentProject}
})()