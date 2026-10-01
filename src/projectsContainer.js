export const projectsContainer = (() =>{
    const projectsArray = []
    const getProjectsArray = () =>  projectsArray
    const addProjectToArray = (project) => {
        if (projectsArray.length < maxLength){
            projectsArray.push(project)
        }
    } 
    const removeProjectFromArray = (project) => projectsArray.splice(projectsArray.indexOf(project), 1)

    const maxLength = 15
    const getMaxArrayLength = () => maxLength


    // const toJSON = () =>{
    //     return projectsArray
    // }

    return{
        getProjectsArray,
        addProjectToArray,
        removeProjectFromArray,
        getMaxArrayLength,
    }
})()