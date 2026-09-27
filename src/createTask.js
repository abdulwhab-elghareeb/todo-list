export function createTask(title, description, dueDate, priority, parentProjectIdx, taskState=false){
    const id = crypto.randomUUID()
    const getId = () => id

    let isComplete = taskState
    const completed = () => isComplete,
          toggleState = () => isComplete? isComplete = false : isComplete = true

        
    const toJSON = () =>{
        return{
            title,
            description,
            dueDate,
            priority,
            parentProjectIdx,
            isComplete
        }
    }

    return {
        toJSON,
        title,
        description,
        dueDate,
        priority,
        parentProjectIdx,
        getId,
        completed,
        toggleState,
    }
}