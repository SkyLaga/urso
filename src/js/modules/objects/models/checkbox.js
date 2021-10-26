class ModulesObjectsModelsCheckbox extends Urso.Core.Modules.Objects.BaseModel {
    constructor(params) {
        super(params);

        this._isDisabled = false;
        this._lable = null;
        this._checkbox = null;
        this.currentFrame = '';

        this.type = Urso.types.objects.CHECKBOX;
        this._addBaseObject();
        this._createCheckbox();

        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
    }

    setupParams(params) {
        super.setupParams(params);

        this.contents = [];
        this.action = Urso.helper.recursiveGet('action', params, () => { this.emit(Urso.events.MODULES_OBJECTS_CHECKBOX_PRESS, this.name) });
        this.lable = Urso.helper.recursiveGet('lable', params, false);
        this.frames = {
            pressed: Urso.helper.recursiveGet('frames.pressed', params, false),
            unpressed: Urso.helper.recursiveGet('frames.unpressed', params, false)
        };

        this.defaultFrame = Urso.helper.recursiveGet('defaultFrame', params, 'unpressed'); //pressed or unpressed
    }

    _createCheckbox() {
        this.currentFrame = this.defaultFrame;
        this._checkbox = this._createObject(this.frames[this.defaultFrame])

        if (this.lable)
            this._lable = this._createObject(this.lable);
    }

    _createObject(model) {
        model = Urso.helper.objectClone(model);
        let object = Urso.objects.create(model, this);

        object._baseObject.interactive = true;
        object._baseObject.buttonMode = true;

        object._baseObject
            .on('pointerdown', this._onButtonDown.bind(this))
            .on('pointerup', this._onButtonUp.bind(this))
            .on('pointerupoutside', this._onButtonUp.bind(this))

        return object;
    }

    enable() {
        if (!this._isDisabled)
            return false;

        this._isDisabled = false;
    }

    disable() {
        if (this._isDisabled)
            return false;

        this._isDisabled = true;
    }

    _addBaseObject() {
        this._baseObject = new PIXI.Container();
    };

    _onButtonDown() {
        if (this._isDisabled)
            return false;

        this.currentFrame = this.currentFrame === 'pressed' ? 'unpressed' : 'pressed';
        this._changeTexture(this.currentFrame);
    }

    _onButtonUp() {
        if (this._isDisabled)
            return false;

        if (this.action)
            this.action();
    }

    _drawGraphics({ polygon, rectangle, fillColor }) {
        if (!polygon && !rectangle)
            return;

        this._checkbox._baseObject.clear();
        this._checkbox._baseObject.beginFill(fillColor);

        if (polygon && polygon.length) {
            this._checkbox._baseObject.drawPolygon(polygon);
        } else if (rectangle && rectangle.length) {
            this._checkbox._baseObject.drawRect(...rectangle)
        }

        this._checkbox._baseObject.endFill();
    };

    _changeTexture(key) {
        if (this.frames[key].type === 10)
            this._drawGraphics(this.frames[key].figure);
        else
            this._checkbox.changeTexture(this.frames[key].assetKey);
    }
}

module.exports = ModulesObjectsModelsCheckbox;
