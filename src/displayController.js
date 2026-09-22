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
    const projectTitleInput = document.querySelector("#project-title")
    const projectDescriptionTextarea = document.querySelector("#project-description")

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

    // Adding Projects
    projectsForm.addEventListener("submit", () =>{
        if (projectsContainer.getProjectsArray().length >= projectsContainer.getMaxLength()) return // if the projectsContainer's max limit of projects is reached

        const project = createProject(projectTitleInput.value, projectDescriptionTextarea.value)
        projectsContainer.addProject(project)
        
        const projectListItem = document.createElement("li")

        const projectTitle = document.createElement("div")
        projectTitle.textContent = project.title


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
    })

})()