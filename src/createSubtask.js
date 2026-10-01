import { createTask } from "./createTask.js"

export function createSubtask(title, taskState=false){
    const {getId, completed, toggleState} = createTask(title, ...[,,,], taskState)

    return{
      title,
      getId,
      completed,
      toggleState,
    }
}
