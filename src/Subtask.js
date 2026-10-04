import { Task } from "./Task.js"

export class Subtask{
  #id = crypto.randomUUID()
  #isCompleted
  title
  constructor(title){
    ({title:this.title, id:this.#id, isCompleted:this.#isCompleted} = new Task(title))
  }

  get id(){
    return this.#id
  }

  get isCompleted(){
    return this.#isCompleted
  }

  toggleState(){
    this.#isCompleted? this.#isCompleted = false : this.#isCompleted = true
  }

}
