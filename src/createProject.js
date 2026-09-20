
export function createProject(title, description){
    const todoItemsArray = []

    const getAllTodoItems = () => todoItemsArray

    const addTodoItem = (todoItem) => {
        todoItemsArray.push(todoItem)
    } 

    const removeTodoItem = (todoItem) => {
        todoItemsArray.splice(todoItemsArray.indexOf(todoItem), 1)
    }

    return{
        title,
        description,
        getAllTodoItems,
        addTodoItem,
        removeTodoItem,
    }
}