import { Task } from "./Task.js"

export class Subtask{
  #id = crypto.randomUUID()
  #isCompleted = false
  originalState
  title
  constructor(title, subTaskState=false, originalState){
    ({title:this.title, id:this.#id, isCompleted:this.#isCompleted} = new Task(title, undefined, undefined, undefined, subTaskState))
    this.originalState = originalState

    this.toJSON = function(){
      return{
        title: this.title,
        isCompleted: this.#isCompleted,
        originalState: this.originalState
      }
    }
  }

  get id(){
    return this.#id
  }

  get isCompleted(){
    return this.#isCompleted
  }

  set isCompleted(value){
    if (value === true || value === false) this.#isCompleted = value
  }
  toggleState(){
    this.#isCompleted? this.#isCompleted = false : this.#isCompleted = true
  }

}
