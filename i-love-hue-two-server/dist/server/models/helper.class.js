"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Helper {
    static generateId() {
        let text = "";
        let range = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < 10; i++) {
            text += range.charAt(Math.floor(Math.random() * range.length));
        }
        return text;
    }
    static rng(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
exports.Helper = Helper;
//# sourceMappingURL=helper.class.js.map