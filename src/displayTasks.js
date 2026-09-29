import delIcon  from "./assets/close.svg"
import circleIcon from "./assets/circle-outline.svg"
import expandIcon from "./assets/chevron-down.svg"

import { projectsContainer } from "./projectsContainer.js"
import { createTask } from "./createTask.js"
import * as helper from "./helper.js"
import { displayProjects } from "./displayProjects.js"

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
        // storage.saveProjectsArray()

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
                // storage.saveProjectsArray()
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

            // storage.saveProjectsArray()
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

            // storage.saveProjectsArray()
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

    function addAllSavedTasks(){
        // storage.getAllStoredTasks().forEach(storedTask =>{
        //     const task = createTask(storedTask.title, storedTask.description, storedTask.dueDate, storedTask.priority, storedTask.parentProjectIdx, storedTask.isComplete)
        //     projectsArray[task.parentProjectIdx].addTask(task)
        // })
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