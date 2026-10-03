import { createDOMElement } from "./helper.js"
import delIcon  from "./assets/close.svg"
import circleIcon from "./assets/circle-outline.svg"
import expandIcon from "./assets/chevron-down.svg"
import { intlFormatDistance } from "date-fns";

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

export function createPlaceholderOption(){
    const placeholder = document.createElement('option')
    Object.assign(placeholder, {
        textContent: "Project",
        disabled: true,
        selected: true,
        hidden: true,
        value: "",
    })

    return placeholder
}

export function createProjectOption(project){
    return createDOMElement({elemType:"option", textContent:project.title, dataId:project.getId()})
}

export function createTaskCardContainer(task){
    return createDOMElement({elemType:"div", className:"task-card", dataId:task.getId()})
}

export function createCheckBtn(){
    const checkBtn = createDOMElement({elemType:"button", className:"task-check-btn"})
    const checkBtnImg = createDOMElement({elemType:"img", src:circleIcon, height:"35"})
    checkBtn.appendChild(checkBtnImg)

    return checkBtn
}

export function createCardTitle(task){
    return createDOMElement({elemType:"div", className:"task-title", textContent:task.title})
}

export function createCardDueDate(task){
    return createDOMElement({elemType:"div", className:"task-due-date", textContent:intlFormatDistance(task.dueDate, new Date())})
}

export function createCardDelBtn(){
    const delBtn = createDOMElement({elemType:"button", className:"task-del-btn"})
    const delBtnImg = createDOMElement({elemType:"img", src:delIcon, height:"20"})
    delBtn.appendChild(delBtnImg)
    return delBtn
}

export function createExpandBtn(){
        const expandBtn = createDOMElement({elemType:"button", className:"task-expand-btn"})
        const expandBtnImg = createDOMElement({elemType:"img", src:expandIcon, height:"20"})
        expandBtn.appendChild(expandBtnImg)
        return expandBtn
}