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
        this.points = Urso.helper.recursiveGet('points', params, [0, 1]);
        this.defaultValue = Urso.helper.recursiveGet('defaultValue', params, this.points[0]);
        this.bgTexture = Urso.helper.recursiveGet('bgTexture', params, false);
        this.fillTexture = Urso.helper.recursiveGet('fillTexture', params, false);
        this.handleTexture = Urso.helper.recursiveGet('handleTexture', params, false);
        this.minValueTextModel = Urso.helper.recursiveGet('minValueTextModel', params, false);
        this.maxValueTextModel = Urso.helper.recursiveGet('maxValueTextModel', params, false);
        this.currentValueTextModel = Urso.helper.recursiveGet('currentValueTextModel', params, false);
    }

    _createSliderTextures() {
        this._sliderBg = this._createTexture(this.bgTexture);

        if(this.fillTexture)
            this._fillTexture = this._createFillTexture(this.fillTexture);

        this._sliderHandle = this._createTexture(this.handleTexture);

        this._setEvents(this._sliderBg._baseObject);
        this._setEvents(this._sliderHandle._baseObject);
    }

    _createFillTexture(model){
        const fillTexture = this._createTexture(model);
        const { width, height } = fillTexture._baseObject;
        this._fillMask = Urso.objects.create({
            type: Urso.types.objects.GRAPHICS,
            figure: {
            rectangle: [0, 0, width, height]
            },
            x: -width * fillTexture.anchorX,
            y: -height * fillTexture.anchorY,
        }, this);

        fillTexture._baseObject.mask = this._fillMask._baseObject;
        return fillTexture
    }

    _createValueText() {
        if (this.minValueTextModel) {
            this.minValueText = Urso.objects.create(this.minValueTextModel, this);
            this.minValueText.text = this.points[0];
        }

        if (this.maxValueTextModel) {
            this.maxValueText = Urso.objects.create(this.maxValueTextModel, this);
            this.maxValueText.text = this.points.length <= 2 ? '100' : this.points[this.points.length - 1];
        }

        if(this.currentValueTextModel){
            this.currentValueText = Urso.objects.create(this.currentValueTextModel, this);
        }
    }

    _createTexture(model) {
        if (model.type === Urso.types.objects.GRAPHICS || model.type === Urso.types.objects.IMAGE)
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
            .on('touchmove', this._onTouchmove.bind(this));
    };

    _onTouchmove(event) {
        const position = this._getEventLocalPosition(event);
        this._onPointerMove(position);
    }

    _getEventLocalPosition(event) {
        const world = Urso.objects.getWorld();
        const worldScale = world._baseObject.scale;

        const x = event.data.global.x / worldScale.x;
        const y = event.data.global.y / worldScale.y;

        return { x, y };
    }

    _addBaseObject() {
        this._baseObject = new PIXI.Container();
    };

    _onPointerDown(obj) {
        if (obj.target === this._sliderHandle._baseObject)
            this._handleIsDragging = true;
    }

    _onPointerMove({ x }) {
        if (!this._handleIsDragging)
            return

        if (x < this.x)
            this._sliderHandle.x = 0;
        else if (x > this.x + this._sliderBg._baseObject.width)
            this._sliderHandle.x = this._sliderBg._baseObject.width;
        else
            this._sliderHandle.x = x - this.x;

        this._setFillMask();
    }

    _onPointerUp(obj) {
        this._handleIsDragging = false;
        let x;

        if (obj.target === this._sliderBg._baseObject) {
            x = obj.data.getLocalPosition(obj.target).x;
        } else
            x = this._sliderHandle.x;

        this._dropHandle(x);
    }

    _setDefaultValue(){
        if(!this.points.includes(this.defaultValue))
            this.defaultValue = this.points[0];

        let x = this.points.indexOf(this.defaultValue) * this._sliderBg._baseObject.width / (this.points.length - 1);

        this._setNewValue(x, this.defaultValue);
    }

    _dropHandle(x) {
        let value;
        let handleX;

        if(this.points.length <= 2){
            handleX = x;
            value = ~~(100 / this._sliderBg._baseObject.width * x);
        }
        // calculate closest point
        else{
            for (let i = 0; i < this.points.length; i++) {
                let pointX = i * this._sliderBg._baseObject.width / (this.points.length - 1);
    
                if (typeof (handleX) === 'number' && x - pointX < handleX - x) {
                    handleX = handleX;
                } else {
                    handleX = pointX;
                    value = this.points[i];
                }
            }
        }

        this._setNewValue(handleX, value);
    }

    _setFillMask(){
        if(!this._fillMask)
            return

        const progress = (this._sliderHandle.x - this._sliderBg.x) * 100 / this._fillTexture._baseObject.width * 0.01;
        this._fillMask.scaleX = progress;
    }

    _setNewValue(x, value){
        this._sliderHandle.x = x;
            
        if (this.currentValueText)
            this.currentValueText.text = value;

        this._setFillMask();
        this.emit(Urso.events.MODULES_OBJECTS_SLIDER_SET_NEW_VALUE, { name: this.name, value: value });
    }

    _subscribeOnce() {
        this.addListener(Urso.events.MODULES_SCENES_MOUSE_NEW_POSITION, this._onPointerMove.bind(this));
    }
}

module.exports = ModulesObjectsModelsSlider;
