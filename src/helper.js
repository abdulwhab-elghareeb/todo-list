
export function toCamelCase(kebabCaseStr, wordStartIdx){
    return kebabCaseStr.split("-").at(wordStartIdx) + kebabCaseStr.split("-").slice(wordStartIdx + 1).map((word) => word.at(0).toUpperCase() + word.slice(1).toLowerCase()).join("")
}

export function replaceEventListener(elem, eventType, callBackFunc){
    elem.removeEventListener(String(eventType), callBackFunc)
    elem.addEventListener(String(eventType), callBackFunc)
}

export function createDOMElement(obj){
    const createdElement = document.createElement(obj.elemType);
    
    if (obj.textContent) createdElement.textContent = obj.textContent
    if (obj.className) createdElement.classList.add(obj.className)
    if (obj.id) createdElement.setAttribute("id", obj.id)
    if (obj.dataId) createdElement.dataset.id = obj.dataId
    if (obj.src) createdElement.src = obj.src
    if (obj.height || obj.width) createdElement.height = createdElement.width = obj.height
    if (obj.value) createdElement.value = obj.value

    return createdElement
}