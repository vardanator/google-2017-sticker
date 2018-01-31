
class ButtonsResponse {
    static generateResponse(buttons, requester) {
        if (!buttons) return null;
        return buttons.getOnly(
            function id() { return this._id; },
            'name', 'component', 'color', 'icon_name', 'title',
            'disabled', 'disable_on_request', 'text_direction',
            'order', 'border', 'on_success', 'action'
        );
    }
}

module.exports = ButtonsResponse;
