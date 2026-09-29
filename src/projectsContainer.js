export const projectsContainer = (() =>{
    const projectsArray = []

    const maxLength = 15
    const getMaxArrayLength = () => maxLength

    const getProjectsArray = () => {
        return projectsArray
    }

    const addProjectToArray = (project) => {
        if (projectsArray.length < maxLength){
            projectsArray.push(project)
        }
    } 

    const removeProjectFromArray = (project) =>{
        projectsArray.splice(projectsArray.indexOf(project), 1)
    }

    // const toJSON = () =>{
    //     return projectsArray
    // }

    return{
        getMaxArrayLength,
        getProjectsArray,
        addProjectToArray,
        removeProjectFromArray,
    }
})()