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
// export function saveProjectsArray(){
//     if (!storageAvailable("localStorage")) return

//     localStorage.setItem("projectsContainer", JSON.stringify(projectsContainer))
// }

// export function getSavedProjectsArray(){
//     if (!storageAvailable("localStorage")) return

//     // Returns the projectArray
//     return JSON.parse(localStorage.getItem("projectsContainer"))
// }
