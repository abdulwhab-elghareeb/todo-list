import delIcon  from "./assets/close.svg"

import { projectsContainer } from "./projectsContainer.js"
import { createProject } from "./createProject.js"

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
    function requiredInputHandler(e){
        updateFormSubmissionBtn(e)
        updateCharCount(e)
    }

    function addEventsToInputs(){
        // preventing duplicate events
        Array.from(document.querySelectorAll("input[type='text']:required")).forEach((input) => input.removeEventListener("input", requiredInputHandler))
        Array.from(document.querySelectorAll("input[type='text']:not(:required)")).forEach((input) => input.removeEventListener("input", updateCharCount))

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


    // Resets the char counter
    function resetFormCounters(){
        Array.from(document.querySelectorAll("input[type='text'] + .char-counter")).forEach((charCounter) => {
                charCounter.textContent = `0 / ${document.querySelector("*:has(+ .char-counter)").maxLength}`
            })
    }

    // removes the inputs on the main page
    function clearMainPage(){
        Array.from(document.querySelectorAll("#main .wrapper > div")).forEach(elem => elem.innerHTML="")
    }

    function updateProjectTitle(project){
        document.querySelector(`li[data-id="${project.getId()}"] > button > div`).textContent = project.title
    }

    function getCurrentList(project){
        return document.querySelector(`li[data-id="${project.getId()}"]`)
    }

    function addProject(){
        const projectTitleInput = document.querySelector("#project-title"),
              projectDescriptionInput = document.querySelector("#project-description")

        const project = createProject(projectTitleInput.value.trim(), projectDescriptionInput.value.trim())
        projectsContainer.addProject(project)

        document.querySelector("#main").dataset.id = project.getId()

        return project
    }

    function createProjectList(project){
        const projectListItem = document.createElement("li")
        projectListItem.dataset.id = project.getId()

        const projectListTitle = document.createElement("div")
        projectListTitle.textContent = project.title
        projectListTitle.classList.add("project-title")


        return {projectListItem, projectListTitle}
    }

    function createRemoveProjectBtn(project){
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
            getCurrentList(project).remove()
            updateProjectsCounter()
            updateShowDialogBtn()

            // if the length of array after project removal = 0 clear the main page otherwise click the prevOrNextProject
            projectsArray.length === 0? clearMainPage() : document.querySelector(`li[data-id="${prevOrNextProject.getId()}"] .list-items-container`).click()
        }
        removeProjectBtn.addEventListener("click", removeBtnClickHandler)

        return removeProjectBtn
    }

    // Display the project title and description on the project page
    function renderProjectPage(project){
        clearMainPage()

        function renderProjectTasks(project){
            
        }
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

        const projectPageDescription = document.createElement("input")
        Object.assign(projectPageDescription, {
            name: "project-description",
            id: "project-page-description",
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
            document.querySelector(`#${e.target.id} + .char-counter`).textContent = ""

            project[e.target.name.split("-").at(-1)] = e.target.value.trim() // takes the last word of it's name (title or description)
            e.target.setAttribute("readonly", "")
        }

        [projectPageTitle, projectPageDescription].forEach((input) =>{
            input.addEventListener("dblclick", DoubleClickInputsHandler)
            input.addEventListener("change", (e)=>{
                    ChangeEventHandler(e)
                    updateProjectTitle(project)
                })
        })

        addEventsToInputs() // add input event to the newly created input and input

        projectPageTitle.value = project.title
        projectPageDescription.value = project.description

        Array.from(document.querySelectorAll("#main .note")).forEach((note) => note.textContent = "Double click to edit")

    }

    function createListItemsBtnContainer(project){
        const listItemsBtnContainer = document.createElement("button")
        listItemsBtnContainer.classList.add("list-items-container")
        listItemsBtnContainer.addEventListener("click", () => renderProjectPage(project))
        listItemsBtnContainer.click()
        
        return listItemsBtnContainer
    }

    // Adding Projects
    function renderProject(e){
        if (projectsArray.length >= projectsContainer.getMaxLength()) return // if the projectsContainer's max limit of projects is reached
        const project = addProject(),
              projectListItem = createProjectList(project).projectListItem,
              projectListTitle = createProjectList(project).projectListTitle,
              removeProjectBtn = createRemoveProjectBtn(project),
              listItemsBtnContainer = createListItemsBtnContainer(project)


        

        listItemsBtnContainer.append(projectListTitle, removeProjectBtn)
        projectListItem.append(listItemsBtnContainer)
        document.querySelector("#projects-list").appendChild(projectListItem)

        e.currentTarget.reset()
        updateProjectsCounter()
        updateShowDialogBtn()
        resetFormCounters()
        disableFormSubmissionBtn()
    }
    document.querySelector("#project-dialog > form").addEventListener('submit', renderProject)


    // to do: add indication to the current project (maybe bold text)
})()