export function createTask(title, description, dueDate, priority, taskState=false){
    const subtasksArray = []
    const getSubtasks = () => subtasksArray
    const addSubtask = (subtask) => { if (subtasksArray.length < maxLength) subtasksArray.push(subtask) }
    const removeSubtask = (subtask) => subtasksArray.splice(subtasksArray.indexOf(subtask), 1) 

    const maxLength = 5
    const getMaxLength = () => maxLength

    const id = crypto.randomUUID()
    const getId = () => id

    let isComplete = taskState
    const completed = () => isComplete,
          toggleState = () => isComplete? isComplete = false : isComplete = true

    

    return {
        title,
        description,
        dueDate,
        priority,
        getSubtasks,
        addSubtask,
        removeSubtask,
        getMaxLength,
        getId,
        completed,
        toggleState,
    }
}