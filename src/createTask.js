export function createTask(title, description, dueDate, priorityLevel){
    const priorityList = ["Would|Not Important ", "Could|Less Important", "Should|Important", "Must|Urgent"] // A list of all available priority levels
    if (!priorityList[priorityLevel]) console.log(`Hay, you passed the number ${priorityLevel} as a priority level, but this level doesn't exist`) // Will be removed : this is just to help future me
    return {
        title,
        description,
        dueDate,
        priorityLevel: priorityList[priorityLevel],
    }
}