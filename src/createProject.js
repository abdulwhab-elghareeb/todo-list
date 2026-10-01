
export function createProject(title, description, projectId=crypto.randomUUID()){
    const tasksArray = []
    const getAllTasks = () => tasksArray
    const setArray = (newArr) => tasksArray = newArr || tasksArray
    const addTask = (task) => tasksArray.push(task)
    const removeTask = (task) => tasksArray.splice(tasksArray.indexOf(task), 1)

    const id = projectId
    const getId = () => id

    return{
        title,
        description,
        getAllTasks,
        setArray,
        addTask,
        removeTask,
        getId,
    }
}