import { Task } from "./Task.js"

export function createSubtask(title, taskState=false){
    const {id, isCompleted, toggleState} = new Task(title)

    return{
      title,
      getId,
      isCompleted,
      toggleState,
    }
}
