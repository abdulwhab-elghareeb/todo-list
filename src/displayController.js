import delIcon  from "./assets/close.svg"
import circleIcon from "./assets/circle-outline.svg"
import expandIcon from "./assets/chevron-down.svg"

import { projectsContainer } from "./projectsContainer.js"
import { createProject } from "./createProject.js"
import { createTask } from "./createTask.js"
import * as helper from "./helper.js"



export const displayController = (() =>{
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

    // Opens the dialog
    function openDialog(){
        document.querySelector("#project-dialog").showModal()
        addEventsToInputs()
    }
    document.querySelector("#project-dialog-show-btn").addEventListener("click", openDialog)

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

    // Updates the form submission btn depending on the input if it's valid or not
    function updateFormSubmissionBtn(e){
        const formSubmissionBtn = document.querySelector(`#${e.target.closest("dialog").id} button[id*='submit']`) // gets the inputs's parent dialog and from there gets the btn
        e.target.checkValidity()? formSubmissionBtn.removeAttribute("disabled") : formSubmissionBtn.setAttribute("disabled","")
    }

    function disableFormSubmissionBtn(){
        Array.from(document.querySelectorAll("button[id*='submit']")).forEach((btn) => btn.setAttribute("disabled", ""))
    }

    // Display the current number of characters in the form inputs 
    function updateCharCount(e){
        const charCounter = document.querySelector(`#${e.target.id} + .char-counter`)
        charCounter.textContent = `${e.target.value.length} / ${e.target.maxLength}`
    }

    // Updates the project form submission btn & char count
    function requiredInputHandler(e){
        updateFormSubmissionBtn(e)
        updateCharCount(e)
    }

    function addEventsToInputs(){
        // preventing duplicate events
        Array.from(document.querySelectorAll("input[type='text']:required")).forEach((input) => input.removeEventListener("input", requiredInputHandler))
        Array.from(document.querySelectorAll("textarea, input[type='text']:not(:required)")).forEach((textArea) => textArea.removeEventListener("input", updateCharCount))

        Array.from(document.querySelectorAll("input[type='text']:required")).forEach((input) => input.addEventListener("input", requiredInputHandler))
        Array.from(document.querySelectorAll("textarea, input[type='text']:not(:required)")).forEach((textArea) => textArea.addEventListener("input", updateCharCount))
    }

    // Resets the char counter
    function resetFormCounters(){
        Array.from(document.querySelectorAll("input[type='text'] + .char-counter, textarea + .char-counter")).forEach((charCounter) => {
                charCounter.textContent = `0 / ${document.querySelector("*:has(+ .char-counter)").maxLength}`
            })
    }

    // removes the inputs on the main page
    function clearMainPage(){
        if (!document.querySelector("#main input")) return
        document.querySelector("#main input").remove()
        document.querySelector("#main textarea").remove()
        document.querySelectorAll("#main span").forEach((span) => span.textContent = "")
    }

    // Adding Projects
    function addProject(e){
        if (projectsArray.length >= projectsContainer.getMaxLength()) return // if the projectsContainer's max limit of projects is reached

        const projectsList = document.querySelector("ul"),
              projectTitle = document.querySelector("#project-title"),
              projectDescription = document.querySelector("#project-description")

        const project = createProject(projectTitle.value.trim(), projectDescription.value.trim())
        projectsContainer.addProject(project)
        
        const projectListItem = document.createElement("li")
        projectListItem.dataset.id = project.getId()

        const projectListTitle = document.createElement("div")
        projectListTitle.textContent = project.title
        projectListTitle.classList.add("project-title")

        const removeProjectBtn = document.createElement("button")
        removeProjectBtn.classList.add('project-remove-btn')

        const removeBtnImg = document.createElement("img")
        removeBtnImg.src = delIcon
        removeBtnImg.height = removeBtnImg.width = "15"

        removeProjectBtn.appendChild(removeBtnImg)
    
        function removeBtnClickHandler(e){
            e.stopPropagation()
            const prevOrNextProject = projectsArray[projectsArray.indexOf(project) - 1] || projectsArray[projectsArray.indexOf(project) + 1] // get the prev project or the next one if the prev is not found       
            projectsContainer.removeProject(project)
            projectListItem.remove()
            updateProjectsCounter()
            updateShowDialogBtn()

            // if the length of array after project removal = 0 clear the main page otherwise click the prevOrNextProject
            projectsArray.length === 0? clearMainPage() : document.querySelector(`li[data-id="${prevOrNextProject.getId()}"] .list-items-container`).click()
        }
        removeProjectBtn.addEventListener("click", removeBtnClickHandler)

        // Display the project title and description on the project page
        function renderProjectPage(){
            clearMainPage()

            // Creating the main inputs
            const projectPageTitle = document.createElement("input")
            Object.assign(projectPageTitle, {
                type: "text",
                name: "project-title",
                id: "project-page-title",
                placeholder: "Title",
                minLength: "2",
                maxLength: "30",
                pattern: "^\S{2,}.*",
                readOnly: true,
            })
            document.querySelector("#main .title-container").prepend(projectPageTitle)

            const projectPageDescription = document.createElement("textarea")
            Object.assign(projectPageDescription, {
                name: "project-description",
                id: "project-page-description",
                rows: "1",
                autocorrect: "on",
                placeholder: "Description",
                maxLength: "80",
                readOnly: true,
            })
            document.querySelector("#main .description-container").prepend(projectPageDescription)

            // inputs events
            function DoubleClickInputsHandler(e){
                e.target.removeAttribute("readonly")
            }

            function ChangeEventHandler(e){
                const charCounter = document.querySelector(`#${e.target.id} + .char-counter`)
                charCounter.textContent = ""

                project[e.target.name.split("-").at(-1)] = e.target.value.trim() // takes the last word of it's name (title or description)
                e.target.setAttribute("readonly", "")
            }

            projectPageTitle.addEventListener("dblclick", DoubleClickInputsHandler)
            projectPageTitle.addEventListener("change", (e)=>{
                if (!(/^\S{2,}.*/).test(projectPageTitle.value)) return // if the value doesn't match the required pattern
                ChangeEventHandler(e)
                projectTitle.textContent = project.title
            })

            projectPageDescription.addEventListener("dblclick", DoubleClickInputsHandler)
            projectPageDescription.addEventListener("change", ChangeEventHandler)
            projectPageDescription.addEventListener("keydown", (e) =>{
                if(e.key === "Enter"){
                    e.preventDefault()
                    ChangeEventHandler(e)
                }
            })
            
            addEventsToInputs() // add input event to the newly created input and textarea

            projectPageTitle.value = project.title
            projectPageDescription.value = project.description

            Array.from(document.querySelectorAll("#main .note")).forEach((note) => note.textContent = "Double click to edit")

        }

        const listItemsBtnContainer = document.createElement("button")
        listItemsBtnContainer.classList.add("list-items-container")
        listItemsBtnContainer.addEventListener("click", renderProjectPage)
        listItemsBtnContainer.click()

        listItemsBtnContainer.append(projectListTitle, removeProjectBtn)
        projectListItem.append(listItemsBtnContainer)
        projectsList.appendChild(projectListItem)

        e.target.reset()
        updateProjectsCounter()
        updateShowDialogBtn()
        resetFormCounters()
        disableFormSubmissionBtn()
    }
    document.querySelector("#project-dialog > form").addEventListener('submit', addProject)


    // to do: add indication to the current project (maybe bold text)

    // Adding tasks
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
        

            projectSelection.appendChild(projectOption)
        })
    }

    function adjustTaskSubmitBtn(e){
        const submitBtn = document.querySelector("#task-submit-btn")
        e.currentTarget.id === "task-add-btn"? submitBtn.textContent = "Add" : submitBtn.textContent = "save"
    }

    function openTaskDialog(e){
        renderProjectSelection()
        adjustTaskSubmitBtn(e)
        document.querySelector("#tasks-dialog").showModal()
    }
    document.querySelector("#task-add-btn").addEventListener("click", openTaskDialog)

    function updateDisplayedTask(task){
        document.querySelector(`#task-card[data-id='${task.getId()}'] .task-title`).textContent = task.title
        document.querySelector(`#task-card[data-id='${task.getId()}'] .task-due-date`).textContent = task.dueDate
    }

    function addTask(){

        const taskFormElements = Array.from(document.querySelectorAll("#tasks-dialog form input, #tasks-dialog form select"))

        const task = createTask(taskFormElements[0].value, taskFormElements[1].value, taskFormElements[2].value, taskFormElements[3].value)

        const selectedProject = projectsArray.find((project) => project.title == taskFormElements[4].value)
        selectedProject.addTask(task)

        // displaying
        const taskCardContainer = document.createElement("div")
        taskCardContainer.setAttribute("id", "task-card")
        taskCardContainer.dataset.id = task.getId()


        function taskContainerClickHandler(e){
            const tasksDialog = document.querySelector("#tasks-dialog")
            tasksDialog.showModal()
            
            // adjust the submit btn
            const saveBtn = document.querySelector("#task-submit-btn")
            adjustTaskSubmitBtn(e)
            
            // setting the values of inputs
            taskFormElements.forEach(formElement => {
                (formElement.id == "task-project")? formElement.value = `${selectedProject.title}` : formElement.value = task[`${helper.toCamelCase(formElement.id, 1)}`]
            }) 

            function saveBtnHandler(e){
                e.preventDefault()

                taskFormElements.forEach(formElement => {
                    (formElement.id == "task-project")? selectedProject.title = formElement.value : task[`${helper.toCamelCase(formElement.id, 1)}`] = formElement.value 
                }) 

                updateDisplayedTask(task)
                document.querySelector("#tasks-dialog form").reset()
                tasksDialog.close()
            }
            saveBtn.addEventListener("click", saveBtnHandler, {once:true})
        }
        taskCardContainer.addEventListener("click", taskContainerClickHandler)

        const checkBtn = document.createElement("button"),
              checkBtnImg = document.createElement("img")
        checkBtn.classList.add("task-check-btn")
        checkBtnImg.src = circleIcon
        checkBtnImg.height = checkBtnImg.width = "35"
        checkBtn.appendChild(checkBtnImg)

        function checkBtnClickHandler(e){
            e.stopPropagation()

            task.toggleState();
            (task.completed())? e.currentTarget.classList.add("checked") : e.currentTarget.classList.remove("checked")
        }
        checkBtn.addEventListener("click", checkBtnClickHandler)

        const cardTaskTitle = document.createElement("div"),
              cardTaskDueDate = document.createElement("div")
        cardTaskTitle.classList.add("task-title")
        cardTaskDueDate.classList.add("task-due-date")
        cardTaskTitle.textContent = task.title
        cardTaskDueDate.textContent = task.dueDate

        const delBtn = document.createElement("button"),
              delBtnImg = document.createElement("img")
        delBtn.classList.add("task-del-btn")
        delBtnImg.src = delIcon
        delBtnImg.height = delBtnImg.width = 20
        delBtn.appendChild(delBtnImg)

        function delBtnClickHandler(e){
            e.stopPropagation()

            selectedProject.removeTask(task)
            taskCardContainer.remove()
        }
        delBtn.addEventListener("click", delBtnClickHandler )

        const expandBtn = document.createElement("button"),
              expandBtnImg = document.createElement("img")

        expandBtn.classList.add("task-expand-btn")
        expandBtnImg.src = expandIcon
        expandBtnImg.height = expandBtnImg.width = 20
        expandBtn.appendChild(expandBtnImg)


        taskCardContainer.append(checkBtn, cardTaskTitle, cardTaskDueDate, delBtn, expandBtn)
        document.querySelector("#main .wrapper").appendChild(taskCardContainer)
    }

    document.querySelector("#tasks-dialog form").addEventListener("submit", addTask)
})()