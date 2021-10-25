class ModulesObjectsModelsSlider extends Urso.Core.Modules.Objects.BaseModel {
    constructor(params) {
        super(params);

        this.type = Urso.types.objects.SLIDER;
        this._sliderBg = null;
        this._sliderHandle = null;
        this._baseObject = null;
        this._handleIsPulling = false;

        this._addBaseObject();
        this._createSliderTextures();
        this._createValueText();
        this._setDefaultValue();
    }

    setupParams(params) {
        super.setupParams(params);
        this.contents = [];
        this.points = Urso.helper.recursiveGet('points', params, 100);
        this.defaultValue = Urso.helper.recursiveGet('defaultValue', params, false);
        this.bgTexture = Urso.helper.recursiveGet('bgTexture', params, false);
        this.handleTexture = Urso.helper.recursiveGet('handleTexture', params, false);
        this.minValueTextModel = Urso.helper.recursiveGet('minValueTextModel', params, false);
        this.maxValueTextModel = Urso.helper.recursiveGet('maxValueTextModel', params, false);
        this.currentValueTextModel = Urso.helper.recursiveGet('currentValueTextModel', params, false);
    }

    _createSliderTextures() {
        this._sliderBg = this._createTexture(this.bgTexture);
        this._sliderHandle = this._createTexture(this.handleTexture);

        this._setEvents(this._sliderBg._baseObject);
        this._setEvents(this._sliderHandle._baseObject);
    }

    _createValueText() {
        if (this.minValueTextModel) {
            this.minValueText = Urso.objects.create(this.minValueTextModel, this);
            this.minValueText._baseObject.text = '0';
        }

        if (this.maxValueTextModel) {
            this.maxValueText = Urso.objects.create(this.maxValueTextModel, this);
            this.maxValueText._baseObject.text = this.points;
        }

        if(this.currentValueTextModel){
            this.currentValueText = Urso.objects.create(this.currentValueTextModel, this);
        }
    }

    _createTexture(model) {
        if (model.type === 10 || model.type === 2)
            return Urso.objects.create(model, this);
        else
            Urso.logger.error('ModulesObjectsModelsSlider objects error: textures should be GRAPHICS or IMAGE type');
    }

    _setEvents(obj) {
        obj.interactive = true;
        obj.buttonMode = true;

        obj
            .on('pointerdown', this._onPointerDown.bind(this))
            .on('pointerup', this._onPointerUp.bind(this))
            .on('pointerupoutside', this._onPointerUp.bind(this))
    }

    _addBaseObject() {
        this._baseObject = new PIXI.Container();
    };

    _onPointerDown(obj) {
        if (obj.target === this._sliderHandle._baseObject)
            this._handleIsDragging = true;
    }

    _onMouseMove({ x }) {
        if (!this._handleIsDragging)
            return

        if (x < this.x)
            this._sliderHandle._baseObject.x = 0;
        else if (x > this.x + this._sliderBg._baseObject.width)
            this._sliderHandle._baseObject.x = this._sliderBg._baseObject.width;
        else
            this._sliderHandle._baseObject.x = x - this.x;
    }

    _onPointerUp(obj) {
        this._handleIsDragging = false;
        let x;

        if (obj.target === this._sliderBg._baseObject) {
            x = obj.data.getLocalPosition(obj.target).x;
        } else
            x = this._sliderHandle._baseObject.x;

        this._dropHandle(x);
    }

    _setDefaultValue(){
        if(!this.defaultValue)
            return

        if(this.defaultValue < 0)
            this.defaultValue = 0;
        else if(this.defaultValue > this.points)
            this.defaultValue = this.points;

        let x = this.defaultValue * this._sliderBg._baseObject.width / this.points;
        this._setNewValue(x, this.defaultValue);
    }

    _dropHandle(x) {
        let value;
        let handleX;
        // calculate closest point
        for (let i = 0; i <= this.points; i++) {
            let pointX = i * this._sliderBg._baseObject.width / this.points;

            if (typeof (handleX) === 'number' && x - pointX < handleX - x) {
                handleX = handleX;
            } else {
                handleX = pointX;
                value = i;
            }
        }

        this._setNewValue(handleX, value)
    }

    _setNewValue(x, value){
        this._sliderHandle.x = x;

        if (this.currentValueText)
            this.currentValueText._baseObject.text = value;

        this.emit(Urso.events.MODULES_OBJECTS_SLIDER_PRESS, { name: this.name, value: value });
    }

    _subscribeOnce() {
        this.addListener(Urso.events.MODULES_SCENES_MOUSE_NEW_POSITION, this._onMouseMove.bind(this));
    }
}

module.exports = ModulesObjectsModelsSlider;
