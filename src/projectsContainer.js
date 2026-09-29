export const projectsContainer = (() =>{
    const projectsArray = []

    const maxLength = 15
    const getMaxLength = () => maxLength

    const getProjectsArray = () => {
        return projectsArray
    }

    const addProject = (project) => {
        if (projectsArray.length < maxLength){
            projectsArray.push(project)
        }
    } 

    const removeProject = (project) =>{
        projectsArray.splice(projectsArray.indexOf(project), 1)
    }

    // const toJSON = () =>{
    //     return projectsArray
    // }

    return{
        getMaxLength,
        getProjectsArray,
        addProject,
        removeProject,
    }
})()