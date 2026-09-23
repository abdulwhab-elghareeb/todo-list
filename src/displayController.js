import delIcon  from "./assets/close.svg"

import { projectsContainer } from "./projectsContainer.js"
import { createProject } from "./createProject.js"
import { createTask } from "./createTask.js"


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
        const formSubmissionBtn = document.querySelector("#project-form-submit-btn")

        if (!e) return formSubmissionBtn.setAttribute("disabled", "") // if called without e argument add disabled back to the button
        e.target.checkValidity()? formSubmissionBtn.removeAttribute("disabled") : formSubmissionBtn.setAttribute("disabled","")
    }

    // Display the current number of characters in the form inputs 
    function updateCharCount(e){
        const charCounter = document.querySelector(`#${e.target.id} + .char-counter`)
        charCounter.textContent = `${e.target.value.length} / ${e.target.maxLength}`
    }

    // Updates the project form submission btn & char count
    function inputEventHandler(e){
        updateFormSubmissionBtn(e)
        updateCharCount(e)
    }

    function addEventsToInputs(){
        // preventing duplicate events
        Array.from(document.querySelectorAll("input[type='text']")).forEach((input) => input.removeEventListener("input", inputEventHandler))
        Array.from(document.querySelectorAll("textarea")).forEach((textArea) => textArea.removeEventListener("input", updateCharCount))

        Array.from(document.querySelectorAll("input[type='text']")).forEach((input) => input.addEventListener("input", inputEventHandler))
        Array.from(document.querySelectorAll("textarea")).forEach((textArea) => textArea.addEventListener("input", updateCharCount))
    }

    // Resets the char counter
    function resetFormCounters(){
        // reset input counter
        document.querySelector("#dialog-title-input + .char-counter").textContent = `0 / ${document.querySelector("input").maxLength}`

        // reset textarea counter
        document.querySelector("#dialog-description-textarea + .char-counter").textContent = `0 / ${document.querySelector("textarea").maxLength}`
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

        const projectsList = document.querySelector("ul")

        const dialogTitleInput = document.querySelector("#dialog-title-input")
        const dialogDescriptionTextarea = document.querySelector("#dialog-description-textarea")

        const project = createProject(dialogTitleInput.value.trim(), dialogDescriptionTextarea.value.trim())
        projectsContainer.addProject(project)
        
        const projectListItem = document.createElement("li")
        projectListItem.dataset.id = project.getId()

        const projectTitle = document.createElement("div")
        projectTitle.textContent = project.title
        projectTitle.classList.add("project-title")

        const removeProjectBtn = document.createElement("button")
        removeProjectBtn.classList.add('project-remove-btn')

        const removeBtnImg = document.createElement("img")
        removeBtnImg.src = delIcon
        removeBtnImg.height = removeBtnImg.width = "15"

        removeProjectBtn.appendChild(removeBtnImg)
    
        function removeBtnClickHandler(e){
            e.stopPropagation()
            projectsContainer.removeProject(project)
            projectListItem.remove()
            updateProjectsCounter()
            updateShowDialogBtn()
            
            if (projectsArray.length > 1){
                const prevProject = projectsArray[projectsArray.indexOf(project) - 1] || projectsArray[projectsArray.indexOf(project) + 1] // get the prev project or the next one if the prev is not found
                document.querySelector(`li[data-id="${prevProject.getId()}"] .list-items-container`).click()
            }else{
                clearMainPage()
            }
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
                required: true,
                readOnly: true,
            })
            document.querySelector("#main .title-input-container").prepend(projectPageTitle)

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
            document.querySelector("#main .description-textarea-container").prepend(projectPageDescription)

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
                e.stopPropagation()
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

        }

        const listItemsBtnContainer = document.createElement("button")
        listItemsBtnContainer.classList.add("list-items-container")
        listItemsBtnContainer.addEventListener("click", renderProjectPage)
        listItemsBtnContainer.click()

        listItemsBtnContainer.append(projectTitle, removeProjectBtn)
        projectListItem.append(listItemsBtnContainer)
        projectsList.appendChild(projectListItem)

        e.target.reset()
        updateProjectsCounter()
        updateShowDialogBtn()
        resetFormCounters()
        updateFormSubmissionBtn()
    }
    document.querySelector("#project-dialog > form").addEventListener('submit', addProject)

})()