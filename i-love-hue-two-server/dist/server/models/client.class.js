"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    constructor(id, webSocket) {
        this.id = id;
        this.webSocket = webSocket;
    }
    static generateId() {
        let text = "";
        let range = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 5; i++) {
            text += range.charAt(Math.floor(Math.random() * range.length));
        }
        return text;
    }
}
exports.Client = Client;
//# sourceMappingURL=client.class.js.map