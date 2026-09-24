export function createTask(title, description, dueDate, priority){
    const id = crypto.randomUUID()
    const getId = () => id

    let isComplete = false
    const completed = () => isComplete,
          toggleState = () => isComplete? isComplete = false : isComplete = true


    return {
        title,
        description,
        dueDate,
        priority,
        getId,
        completed,
        toggleState,
    }
}