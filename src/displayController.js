import delIcon  from "./assets/close.svg"

import { projectsContainer } from "./projectsContainer.js"
import { createProject } from "./createProject.js"
import { createTask } from "./createTask.js"


export const displayController = (() =>{
    const projectsList = document.querySelector("ul")
    
    const addingProjectsForm = document.querySelector("#add-project-dialog > form")
    const projectTitleInput = document.querySelector("#project-title")
    const projectDescriptionTextarea = document.querySelector("#project-description")

    // Adding Projects
    addingProjectsForm.addEventListener("submit", () =>{
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
    })


})()