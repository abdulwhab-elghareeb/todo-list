export const projectsContainer = {
    _projectsArray: [],
    
    get projectsArray(){
        return this._projectsArray
    },

    addProjectToArray: function(project){
        this._projectsArray.push(project)
    },

    removeProjectFromArray: function(project){
        this._projectsArray.splice(this._projectsArray.indexOf(project), 1)
    },
} // We don't need to create multiple from it so it's just an object literal