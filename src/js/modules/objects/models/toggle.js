
const UrsoCoreModulesObjectsModelsButton = require('./button');

class ModulesObjectsModelsToggle extends UrsoCoreModulesObjectsModelsButton {
    constructor(params) {
        super(params);

        this._toggleStatus = 'unpressed';

        this.type = Urso.types.objects.TOGGLE;
        this._addBaseObject();

        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
    }

    setupParams(params) {
        super.setupParams(params);

        this.action = Urso.helper.recursiveGet('action', params, () => { 
            this.emit(Urso.events.MODULES_OBJECTS_TOGGLE_PRESS, { name: this.name, status: this._toggleStatus }) 
        });

        this.buttonFrames = {
            pressedOver: Urso.helper.recursiveGet('buttonFrames.pressedOver', params, false),
            pressedOut: Urso.helper.recursiveGet('buttonFrames.pressedOut', params, false),
            unpressedOver: Urso.helper.recursiveGet('buttonFrames.unpressedOver', params, false),
            unpressedOut: Urso.helper.recursiveGet('buttonFrames.unpressedOut', params, false),
            pressedDown: Urso.helper.recursiveGet('buttonFrames.pressedDown', params, false),
            unpressedDown: Urso.helper.recursiveGet('buttonFrames.unpressedDown', params, false),
            pressedDisabled: Urso.helper.recursiveGet('buttonFrames.pressedDisabled', params, false),
            unpressedDisabled: Urso.helper.recursiveGet('buttonFrames.unpressedDisabled', params, false),
        }
    }

    setButtonFrame(key, assetKey) {
        this.buttonFrames[key] = assetKey;

        if (this._isOver)
            this._changeTexture(`${this._toggleStatus}Over`);
        else if(this._isDown)
            this._changeTexture(`${this._toggleStatus}Down`);
        else if(this._isDisabled)
            this._changeTexture(`${this._toggleStatus}Disabled`);
        else
            this._changeTexture(`${this._toggleStatus}Out`);
    }

    enable() {
        if (!this._isDisabled)
            return false;

        if (this._isOver)
            this._changeTexture(`${this._toggleStatus}Over`);
        else
            this._changeTexture(`${this._toggleStatus}Out`);

        this._isDisabled = false;
    }

    disable() {
        if (this._isDisabled)
            return false;

        this._changeTexture(`${this._toggleStatus}Disabled`);
        this._isDisabled = true;
    }

    _addBaseObject() {
        this._baseObject = new PIXI.Sprite();
        this._changeTexture('unpressedOut');

        this._baseObject.interactive = true;
        this._baseObject.buttonMode = true;

        if (this.pixelPerfectOver) {
            //todo
        }

        if (this.pixelPerfectClick) {
            //todo
        }

        this._baseObject
            .on('pointerdown', this._onButtonDown.bind(this))
            .on('pointerup', this._onButtonUp.bind(this))
            .on('pointerupoutside', this._onButtonUp.bind(this))
            .on('pointerover', this._onButtonOver.bind(this))
            .on('pointerout', this._onButtonOut.bind(this));
    };

    _onButtonDown() {
        if (this._isDisabled)
            return false;

        this._isDown = true;

        if (this.keyDownAction)
            this.keyDownAction();

        if (this._isDisabled) //can be disabled after keyDownAction
            return false;

        this._changeTexture(`${this._toggleStatus}Down`);

        this._toggleStatus = this._toggleStatus === 'pressed' ? 'unpressed' : 'pressed';
    }

    _onButtonUp() {
        if (this._isDisabled)
            return false;

        this._isDown = false;

        if (this.action)
            this.action();

        if (this._isDisabled) //can be disabled after action
            return false;

        if (this._isOver)
            this._changeTexture(`${this._toggleStatus}Over`);
        else
            this._changeTexture(`${this._toggleStatus}Out`);
    }

    _onButtonOver() {
        this._isOver = true;

        if (this._isDisabled || this._isDown)
            return false;

        if (this.mouseOverAction)
            this.mouseOverAction();

        this._changeTexture(`${this._toggleStatus}Over`);
    }

    _onButtonOut() {
        this._isOver = false;

        if (this._isDisabled || this._isDown)
            return false;

        if (this.mouseOutAction)
            this.mouseOutAction();

        this._changeTexture(`${this._toggleStatus}Out`);
    }

    _changeTexture(key) {
        let texture = Urso.cache.getTexture(this.buttonFrames[key]);

        if (!texture) {
            if (key === `${this._toggleStatus}Out`) {
                Urso.logger.error('ModulesObjectsModelsButton assets error: no out image ' + this.buttonFrames.out);
                return false;
            }

            this._changeTexture(`${this._toggleStatus}Out`); // load default texture for this key
            return false;
        }

        this._baseObject.texture = texture;
        return true;
    }
}

module.exports = ModulesObjectsModelsToggle;
