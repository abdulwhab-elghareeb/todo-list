import { Project } from "./Project.js"

export class Task{
    #subtasksArray = []
    #maxArrayLength = 5
    #id
    #isCompleted
    title
    description
    dueDate
    priority
    constructor(title, description, dueDate, priority, taskState=false){
        ({title: this.title, description: this.description, id:this.#id} = new Project(title, description))
        this.dueDate = dueDate
        this.priority = priority
        this.#isCompleted = taskState

        this.toJSON = function(){
            return{
                title: this.title,
                description: this.description,
                dueDate: this.dueDate,
                priority: this.priority,
                subtasksArray: this.#subtasksArray,
                isCompleted: this.#isCompleted
            }
        }
    }

    get id(){
        return this.#id
    }

    get subtasksArray(){
        return this.#subtasksArray
    }

    get isCompleted(){
        return this.#isCompleted
    }

    get maxArrayLength(){
        return this.#maxArrayLength
    }

    addSubtask(subtask){
        this.#subtasksArray.push(subtask)
    }

    removeSubtask(subtask){
        this.#subtasksArray.splice(this.#subtasksArray.indexOf(subtask), 1)
    }

    toggleState(){
        this.#isCompleted? this.#isCompleted = false : this.#isCompleted = true
    }
    
}