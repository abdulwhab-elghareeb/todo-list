
export function createProject(title, description){
    const tasksArray = []

    const getAllTasks = () => tasksArray

    const addTask = (task) => {
        tasksArray.push(task)
    } 

    const removeTask = (task) => {
        tasksArray.splice(tasksArray.indexOf(task), 1)
    }

    return{
        title,
        description,
        getAllTasks,
        addTask,
        removeTask,
    }
}