export const projectsContainer = (() =>{
    const projectsArray = []
    const getProjectsArray = () =>  projectsArray
    const addProjectToArray = (project) => projectsArray.push(project)
    const removeProjectFromArray = (project) => projectsArray.splice(projectsArray.indexOf(project), 1)



    // const toJSON = () =>{
    //     return projectsArray
    // }

    return{
        getProjectsArray,
        addProjectToArray,
        removeProjectFromArray,
    }
})()