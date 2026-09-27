
export function createProject(title, description, projectId=crypto.randomUUID()){
    const tasksArray = []

    const getAllTasks = () => tasksArray
    const setArray = (newArr) => tasksArray = newArr || tasksArray

    const addTask = (task) => {
        tasksArray.push(task)

    } 

    const removeTask = (task) => {
        tasksArray.splice(tasksArray.indexOf(task), 1)
    }

    const id = projectId
    const getId = () => id

    const toJSON = () =>{
        return{
            title,
            description,
            id,
            tasksArray,
        }
    }

    return{
        toJSON,
        title,
        description,
        getAllTasks,
        setArray,
        addTask,
        removeTask,
        getId,
    }
}