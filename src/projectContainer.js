export const projectContainer = (() =>{
    const projectArray = []

    const getAllProjects = () => projectArray

    const addProject = (project) => {
        projectArray.push(project)
    } 

    const removeProject = (project) =>{
        projectArray.splice(projectArray.indexOf(project), 1)
    }

    return{
        getAllProjects,
        addProject,
        removeProject,
    }
})()