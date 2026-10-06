// import { projectsContainer } from "./projectsContainer.js";



function storageAvailable(type) {
    let storage;
    try {
      storage = window[type];
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        e.name === "QuotaExceededError" &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage &&
        storage.length !== 0
      );
    }
  }


export function saveTaskExpanded(taskId, expandedValue){
    if (!storageAvailable("sessionStorage")) return
    sessionStorage.setItem(taskId, expandedValue)
}


export function saveProjectsArray(projectsContainerArray){
  if(!storageAvailable("localStorage")) return
  localStorage.setItem("projectsArray", JSON.stringify(projectsContainerArray))
}

export function getProjectsArray(){
  return JSON.parse(localStorage.getItem("projectsArray"))
}

export function saveColorMode(currentMode){
  if(!storageAvailable("localStorage")) return
  localStorage.setItem("mode", currentMode)
}

export function saveCurrentProject(projectIndex){
  if(!storageAvailable("localStorage")) return
  localStorage.setItem("currentProjectIdx", projectIndex)
}