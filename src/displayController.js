import delIcon  from "./assets/close.svg"

import { projectsContainer } from "./projectsContainer.js"
import { createProject } from "./createProject.js"
import { createTask } from "./createTask.js"


export const displayController = (() =>{
    const projectsList = document.querySelector("ul")
    const projectsCounter = document.querySelector("#projects-counter")
    
    const addingProjectsForm = document.querySelector("#add-project-dialog > form")
    const projectTitleInput = document.querySelector("#project-title")
    const projectDescriptionTextarea = document.querySelector("#project-description")


    function updateProjectsCounter(){ // updating the color of the counter depending on the amount of projects
        projectsCounter.textContent = `${projectsContainer.getProjectsArray().length} / ${projectsContainer.getMaxLength()}` // current number of projects / max number of projects
        
        projectsContainer.getProjectsArray().length <= projectsContainer.getMaxLength() / 2? projectsCounter.classList = "low" : projectsCounter.classList = "mid"
        if(projectsContainer.getProjectsArray().length == projectsContainer.getMaxLength()) projectsCounter.classList = "max"
    }

    // Adding Projects
    addingProjectsForm.addEventListener("submit", () =>{
        if (projectsContainer.getProjectsArray().length >= projectsContainer.getMaxLength()) return // if the projectsContainer's max limit is reached

        const project = createProject(projectTitleInput.value, projectDescriptionTextarea.value)
        projectsContainer.addProject(project)
        
        const projectListItem = document.createElement("li")

        const projectTitle = document.createElement("div")
        projectTitle.textContent = project.title


        const removeProjectBtn = document.createElement("button")
        removeProjectBtn.classList.add('remove-project-btn')

        const removeBtnImg = document.createElement("img")
        removeBtnImg.src = delIcon
        removeBtnImg.height = removeBtnImg.width = "15"

        removeProjectBtn.appendChild(removeBtnImg)
        
        removeProjectBtn.addEventListener("click", () =>{
            projectsContainer.removeProject(project)
            projectListItem.remove()
        })

        projectListItem.append(projectTitle, removeProjectBtn)
        projectsList.appendChild(projectListItem)

        addingProjectsForm.reset()
        updateProjectsCounter()
    })
})()