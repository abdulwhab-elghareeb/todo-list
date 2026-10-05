import { Task } from "./Task.js"

export class Subtask{
  #id = crypto.randomUUID()
  #isCompleted = false
  preState
  title
  constructor(title, subTaskState=false, preState){
    ({title:this.title, id:this.#id, isCompleted:this.#isCompleted} = new Task(title, undefined, undefined, undefined, subTaskState))
    this.preState = preState

    this.toJSON = function(){
      return{
        title: this.title,
        isCompleted: this.#isCompleted,
        preState: this.preState
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
