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
    static updateArray(oldArr, newArr) {
        if (newArr.length > oldArr.length) {
            newArr.forEach((obj, index) => {
                if (!oldArr[index]) {
                    oldArr.push(obj);
                }
                else {
                    // updated element
                    Object.keys(obj).forEach((prop) => {
                        oldArr[index][prop] = obj[prop];
                    });
                }
            });
        }
        else {
            if (newArr.length === 0)
                oldArr.splice(0, 1);
            else
                oldArr.splice(newArr.length - 1, oldArr.length - 1);
        }
    }
}
exports.Helper = Helper;
//# sourceMappingURL=helper.class.js.map