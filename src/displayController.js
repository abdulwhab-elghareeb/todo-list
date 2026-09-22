import delIcon  from "./assets/close.svg"

import { projectsContainer } from "./projectsContainer.js"
import { createProject } from "./createProject.js"
import { createTask } from "./createTask.js"


export const displayController = (() =>{
    const projectsList = document.querySelector("ul")
    const projectsCounter = document.querySelector("#projects-counter")
    
    const projectsDialog = document.querySelector("#project-dialog")
    const showDialogBtn = document.querySelector("#project-dialog-show-btn")

    const projectsForm = document.querySelector("#project-dialog > form")
    const formTitleInput = document.querySelector("#title-input")
    const titleInputCharCounter = document.querySelector("#title-input + .char-counter")
    const formDescriptionTextarea = document.querySelector("#description-textarea")
    const descriptionTextareaCharCounter = document.querySelector("#description-textarea + .char-counter")
    const formSubmissionBtn = document.querySelector("#project-form-submit-btn")

    function updateProjectsCounter(){ // updating the color of the counter depending on the current amount of projects
        projectsCounter.textContent = `${projectsContainer.getProjectsArray().length} / ${projectsContainer.getMaxLength()}` // current number of projects / max number of projects
        
        projectsContainer.getProjectsArray().length <= projectsContainer.getMaxLength() / 2? projectsCounter.classList = "low" : projectsCounter.classList = "mid"
        if(projectsContainer.getProjectsArray().length == projectsContainer.getMaxLength()) projectsCounter.classList = "max"
    }

    showDialogBtn.addEventListener("click", () => { projectsDialog.showModal() })
    function updateShowDialogBtn(){ // disable or enable the button depending on the current remaining projects slots
        if (projectsContainer.getProjectsArray().length == projectsContainer.getMaxLength()){
            showDialogBtn.classList = "disable"
            showDialogBtn.style.color = "red"
        }else{
            showDialogBtn.classList.remove("disable")
            showDialogBtn.style.color = ""
            
        }
    }

    function updateFormSubmissionBtn(e){// updates the btn depending on the input is valid or not
        if (!e) return formSubmissionBtn.setAttribute("disabled", "") // if called without e argument add disabled back to the button
        e.target.checkValidity()? formSubmissionBtn.removeAttribute("disabled") : formSubmissionBtn.setAttribute("disabled","")
    }

    // Display the current number of characters 
    formTitleInput.addEventListener("input", (e) =>{
        titleInputCharCounter.textContent = `${e.target.value.length} / ${e.target.maxLength}`
        updateFormSubmissionBtn(e)
    })

    formDescriptionTextarea.addEventListener("input", (e) =>{
        descriptionTextareaCharCounter.textContent = `${e.target.value.length} / ${e.target.maxLength}`
    })

    function resetFormCounters(){
        titleInputCharCounter.textContent = `0 / ${formTitleInput.maxLength}`
        descriptionTextareaCharCounter.textContent = `0 / ${formDescriptionTextarea.maxLength}`

    }


    // Adding Projects
    projectsForm.addEventListener("submit", () =>{
        if (projectsContainer.getProjectsArray().length >= projectsContainer.getMaxLength()) return // if the projectsContainer's max limit of projects is reached

        const project = createProject(formTitleInput.value, formDescriptionTextarea.value)
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