const Graphics = require('./graphics.js');
const Image = require('./image.js');
const Text = require('./text.js');

class ModulesObjectsModelsSlider extends Urso.Core.Modules.Objects.BaseModel {
    constructor(params) {
        super(params);

        this.type = Urso.types.objects.SLIDER;
        this._sliderBg = null;
        this._sliderHandle = null;
        this._baseObject = null;
        this._handleIsPulling

        this._addBaseObject();
        this.createSliderTextures();
        this._setValueText();
    }

    setupParams(params) {
        super.setupParams(params);
        this.contents = [];
        this.points = Urso.helper.recursiveGet('points', params, 0);
        this.bgTexture = Urso.helper.recursiveGet('bgTexture', params, false);
        this.handleTexture = Urso.helper.recursiveGet('handleTexture', params, false);
        this.minValueTextModel = Urso.helper.recursiveGet('minValueTextModel', params, false);
        this.maxValueTextModel = Urso.helper.recursiveGet('maxValueTextModel', params, false);
        this.currentValueTextModel = Urso.helper.recursiveGet('currentValueTextModel', params, false);
    }

    createSliderTextures() {
        this._sliderBg = this._createTexture(this.bgTexture);
        this._sliderHandle = this._createTexture(this.handleTexture);

        this._setEvents(this._sliderBg._baseObject);
        this._setEvents(this._sliderHandle._baseObject);

        super.addChild(this._sliderBg);
        super.addChild(this._sliderHandle);
    }

    _setValueText(){
        if(this.minValueTextModel){
            this.minValueText = new Text(this.minValueTextModel);
            this.minValueText._baseObject.text = '0';
            super.addChild(this.minValueText);
        }
            
        if(this.maxValueText){
            this.maxValueText = new Text(this.maxValueTextModel);
            this.maxValueText._baseObject.text = this.points > 2 ? this.points : '100';
            super.addChild(this.maxValueText);
        }
    }

    _createTexture(model) {
        if (model.figure)
            return this._createGraphics(model)

        return this._createSprite(model)
    }

    _createSprite(model) {
        return new Image(model);
    }

    _createGraphics(model) {
        return new Graphics(model);
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
        let { x } = obj.data.getLocalPosition(obj.target)

        if (obj.target === this._sliderHandle._baseObject) {
            this._handleIsDragging = true;
        }else {
            this._dropHandle(x);
        }

    }

    _onMouseMove({x}) {
        if (!this._handleIsDragging)
            return

        if(x < this.x )
            this._sliderHandle._baseObject.x = 0;
        else if(x > this.x + this._sliderBg._baseObject.width)
            this._sliderHandle._baseObject.x = this._sliderBg._baseObject.width;
        else
            this._sliderHandle._baseObject.x = x - this.x
    }

    _onPointerUp(obj) {
        this._handleIsDragging = false;

        if (obj.target === this._sliderHandle._baseObject)
            this._dropHandle();
    }

    _dropHandle(clickX){
        let x = clickX ? clickX : this._sliderHandle._baseObject.x;
        let value;
        let handleX;

        if(this.points >= 2){
            for (let i = 0; i <= this.points; i++){
                let pointX = i * this._sliderBg._baseObject.width / this.points;

                if(typeof(handleX) === 'number' && x - pointX < handleX - x){
                    handleX = handleX;
                }else {
                    handleX = pointX;
                    value = i;
                }
            }
        }else {
            handleX = x;
            value = ~~(this._sliderBg._baseObject.width / x);
        }

        this._sliderHandle._baseObject.x = handleX;

        if(this.currentValueText)
            this.currentValueText.text = value;

        this.emit(Urso.events.MODULES_OBJECTS_SLIDER_PRESS, { name: this.name, value: value } );
    }

    _subscribeOnce() {
        this.addListener(Urso.events.MODULES_SCENES_MOUSE_NEW_POSITION, this._onMouseMove.bind(this));
    }
}

module.exports = ModulesObjectsModelsSlider;
