class ModulesScenesController {
    constructor() {
        this.singleton = true;
        this._service;

        this.init();
    }

    init() {
        this._service = this.getInstance('Service');
    }

    display(name) {
        this._service.display(name);
    }

    loadUpdate(loadProgress) {
        this._service.loadUpdate(loadProgress);
    }

    getPixiWorld() {
        return this.getInstance('PixiWrapper').getPixiWorld();
    }

    getTemplateSize() {
        return this.getInstance('Resolutions').getTemplateSize();
    }

    getMouseCoords() {
        return this.getInstance('PixiWrapper').getCachedMouseCoords();
    }
}

module.exports = ModulesScenesController;
