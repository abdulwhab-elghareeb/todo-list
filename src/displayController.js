import delIcon  from "./assets/close.svg"

import { projectsContainer } from "./projectsContainer.js"
import { createProject } from "./createProject.js"
import { createTask } from "./createTask.js"


export const displayController = (() =>{

    // Closing and opening sidebar
    const sidebarTogglingBtn = document.querySelector("#sidebar-toggling-btn")
    sidebarTogglingBtn.addEventListener("click", (e) =>{
        sidebarTogglingBtn.classList.toggle("sidebar-close")
        document.querySelector("#sidebar").classList.toggle("sidebar-close")
        document.querySelector("#main").classList.toggle("sidebar-close")

    })


    // updating the color of the counter depending on the current amount of projects
    function updateProjectsCounter(){ 
        const projectsCounter = document.querySelector("#projects-counter")

        projectsCounter.textContent = `${projectsContainer.getProjectsArray().length} / ${projectsContainer.getMaxLength()}` // current number of projects / max number of projects
        
        projectsContainer.getProjectsArray().length <= projectsContainer.getMaxLength() / 2? projectsCounter.classList = "low" : projectsCounter.classList = "mid"
        if(projectsContainer.getProjectsArray().length == projectsContainer.getMaxLength()) projectsCounter.classList = "max"
    }

    // Opens the dialog
    const showDialogBtn = document.querySelector("#project-dialog-show-btn")
    showDialogBtn.addEventListener("click", () => {
        const projectsDialog = document.querySelector("#project-dialog")
        projectsDialog.showModal() 
    })

    // disable or enable the dialog button depending on the current remaining projects slots
    function updateShowDialogBtn(){ 
        if (projectsContainer.getProjectsArray().length == projectsContainer.getMaxLength()){
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
    const dialogTitleInput = document.querySelector("#dialog-title-input")
    dialogTitleInput.addEventListener("input", (e) =>{
        const titleInputCharCounter = document.querySelector("#dialog-title-input + span")
        
        titleInputCharCounter.textContent = `${e.target.value.length} / ${e.target.maxLength}`
        updateFormSubmissionBtn(e)
    })

    const dialogDescriptionTextarea = document.querySelector("#dialog-description-textarea")
    dialogDescriptionTextarea.addEventListener("input", (e) =>{
        const descriptionTextareaCharCounter = document.querySelector("#dialog-description-textarea + span")

        descriptionTextareaCharCounter.textContent = `${e.target.value.length} / ${e.target.maxLength}`
    })

    // Resets the char counter
    function resetFormCounters(){
        const titleInputCharCounter = document.querySelector("#dialog-title-input + .char-counter")
        const descriptionTextareaCharCounter = document.querySelector("#dialog-description-textarea + .char-counter")

        titleInputCharCounter.textContent = `0 / ${dialogTitleInput.maxLength}`
        descriptionTextareaCharCounter.textContent = `0 / ${dialogDescriptionTextarea.maxLength}`

    }


    // Adding Projects
    const projectsForm = document.querySelector("#project-dialog > form")
    projectsForm.addEventListener("submit", () =>{
        if (projectsContainer.getProjectsArray().length >= projectsContainer.getMaxLength()) return // if the projectsContainer's max limit of projects is reached

        const projectsList = document.querySelector("ul")

        const project = createProject(dialogTitleInput.value, dialogDescriptionTextarea.value)
        projectsContainer.addProject(project)
        
        const projectListItem = document.createElement("li")

        const projectTitle = document.createElement("div")
        projectTitle.textContent = project.title
        projectTitle.classList.add("project-title")


        const removeProjectBtn = document.createElement("button")
        removeProjectBtn.classList.add('project-remove-btn')

        const removeBtnImg = document.createElement("img")
        removeBtnImg.src = delIcon
        removeBtnImg.height = removeBtnImg.width = "15"

        removeProjectBtn.appendChild(removeBtnImg)
        
        removeProjectBtn.addEventListener("click", () =>{
            projectsContainer.removeProject(project)
            projectListItem.remove()
            updateProjectsCounter()
            updateShowDialogBtn()
        })
        
        projectListItem.append(projectTitle, removeProjectBtn)
        projectsList.appendChild(projectListItem)

        projectsForm.reset()
        updateProjectsCounter()
        updateShowDialogBtn()
        resetFormCounters()
        updateFormSubmissionBtn()
    })

    
})()