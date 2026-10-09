import darkMode from "./assets/dark-mode.svg"
import lightMode from "./assets/light-mode.svg"
import * as storage from "./storage.js"

const root = document.documentElement
const modeImg = document.querySelector("#mode > img")

if(localStorage.getItem("mode")){
    root.className = localStorage.getItem("mode")
    root.className === "dark"? modeImg.src = darkMode : modeImg.src = lightMode
}else{
    storage.saveColorMode("dark")
}

// sidebar open/close transition
function toggleSidebar(e){
    const sidebar = document.querySelector("#sidebar")
    const projectPage = document.querySelector("#project-page");
    
    [e.currentTarget, sidebar, projectPage].forEach(sidebarTransitionElem => sidebarTransitionElem.classList.toggle("sidebar-close"))
}
document.querySelector("#sidebar-toggling-btn").addEventListener("click", toggleSidebar)

// Project page title
window.addEventListener("scroll", () =>{
    const projectPageTitle = document.getElementById("project-page-title").closest("div")
    const triggeringTop = parseInt(window.getComputedStyle(projectPageTitle).top)
    const currentTop = projectPageTitle.getBoundingClientRect().top
    projectPageTitle.classList.toggle("sticky-triggered", triggeringTop == currentTop)
})

// dark mode
function switchModes(){
    const newMode = (root.className == "dark")? "light" : "dark"
    root.className = newMode
    storage.saveColorMode(newMode)

    const newImg = (root.className == "dark")? darkMode : lightMode
    modeImg.setAttribute("src" , newImg)
}
document.getElementById("mode").addEventListener("click", switchModes)

// protecting the user from getting flash banged if the css did not load in time
window.addEventListener("load", () => document.body.classList.remove("preload"))

