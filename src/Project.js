export class Project{
    #id = crypto.randomUUID()
    #tasksArray = []
    title
    description
    constructor(title, description, projectId){
        this.title = title
        this.description = description
    }

    get id(){
        return this.#id
    }

    get tasksArray(){
        return this.#tasksArray
    }

    addTask(task){
        this.#tasksArray.push(task)
    }

    removeTask(task){
        this.#tasksArray.splice(this.#tasksArray.indexOf(task), 1)
    }
}