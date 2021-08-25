ComponentsBaseController = require('./../base/controller.js');

class ComponentsSoundInitialPopupController extends ComponentsBaseController {
    
    constructor(){
        super();

        this.yesButton = null;
        this.noButton = null;
    }

    create(){
        this.yesButton = this.common.findOne('^soundInitialPopupButtonYesGraphics');
        this.noButton = this.common.findOne('^soundInitialPopupButtonNoGraphics');
    }

    _tintHandler({buttonName, pointerOver}){
        let button = buttonName === 'yes' ? this.yesButton : this.noButton;
        button._baseObject.tint = (pointerOver) ? 0xd4be69 : 0xFFFFFF;
    }

    _buttonPressHandler(btnName){
        switch (btnName) {
            case 'soundInitialPopupButtonYesHit':
                this.emit('change.GlobalSound', true);
                break;
            case 'soundInitialPopupButtonNoHit':
                this.emit('change.GlobalSound', false);
                break;
            default:
                return;
        }

        this.common.object.visible = false;
    }

    _subscribeOnce(){
        this.addListener('components.soundInitialPopup.pointerAction.popupButton', this._tintHandler.bind(this));
        this.addListener(Urso.events.MODULES_OBJECTS_HIT_AREA_PRESS, this._buttonPressHandler.bind(this));
    }
}

module.exports = ComponentsSoundInitialPopupController;