import { createDOMElement } from "./helper.js"
import delIcon  from "./assets/close.svg"

export function createProjectSidebarListItem(project){
    return createDOMElement({elemType:"li", dataId:project.getId()})
}

export function createProjectSidebarListTitle(project){
    return createDOMElement({elemType:"div", textContent:project.title, className:"project-title"})
}

export function createProjectRemoveBtn(){
    const removeProjectBtn = createDOMElement({elemType:"button", className:"project-remove-btn"})
    const removeBtnImg = createDOMElement({elemType:"img", src:delIcon, height:"15"})
    removeProjectBtn.appendChild(removeBtnImg)


    return removeProjectBtn
}

export function createProjectPageTitleInput(project){
    const projectPageTitleInput = createDOMElement({elemType:"input", value:project.title})
    Object.assign(projectPageTitleInput, {
        type: "text",
        name: "project-title",
        id: "project-page-title",
        placeholder: "Title",
        minLength: "2",
        maxLength: "50",
        pattern: "^\S{1,}.*",
        readOnly: true,
    })

    return projectPageTitleInput
}

export function createProjectPageDescInput(project){
    const projectPageDescriptionInput = createDOMElement({elemType:"input", value:project.description})
    Object.assign(projectPageDescriptionInput, {
        type: "text",
        name: "project-description",
        id: "project-page-description",
        autocorrect: "on",
        placeholder: "Description",
        maxLength: "80",
        readOnly: true,
    })

    return projectPageDescriptionInput
}

export function createInputCharCounter(){
    return createDOMElement({elemType:"span", className:"char-counter"})
}

export function createProjectPageNote(){
    return createDOMElement({elemType:"span", className:"note", textContent:"Double click to edit"})
}

export function createProjectPageLoader(){
    return createDOMElement({elemType:"button", className:"project-page-loader"})
}