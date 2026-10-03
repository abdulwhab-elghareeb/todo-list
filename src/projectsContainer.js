export const projectsContainer = {
    _projectsArray: [],
    
    get projectsArray(){
        return this._projectsArray
    },

    addProjectToArray: function(project){
        this._projectsArray.push(project)
    },

    removeProjectFromArray: function(project){
        this._projectsArray.splice(projectsArray.indexOf(project), 1)
    },
}