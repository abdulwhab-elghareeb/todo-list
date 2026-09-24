export function createTask(title, description, dueDate, priorityLevel){
    let isComplete = false
    
    const completed = () => isComplete,
          toggleState = () => isComplete? isComplete = false : isComplete = true


    return {
        title,
        description,
        dueDate,
        priorityLevel,
        completed,
        toggleState,
    }
}