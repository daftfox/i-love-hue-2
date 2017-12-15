export class Helper {
    public static generateId(): string {
        let text  = "";
        let range = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (let i = 0; i < 10; i++) {
            text += range.charAt(Math.floor(Math.random() * range.length));
        }

        return text;
    }

    public static rng(min: number, max: number): number {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    public static updateArray(oldArr: Array<any>, newArr: Array<any>): Array<any | void> {
        if (newArr.length > oldArr.length) {
            newArr.forEach((obj, index) => {
                if (!oldArr[index]) { // new element
                    oldArr.push(obj);
                }
            });
        } else if (newArr.length < oldArr.length) {
            if (newArr.length === 0) {
                oldArr = [];
            } else {
                oldArr.splice(newArr.length - 1, (oldArr.length - newArr.length));
            }
        }

        oldArr.forEach((obj, index) => {
            Object.keys(obj).forEach((prop) => {
                if (newArr[index]) obj[prop] = newArr[index][prop];
            });
        });

        return oldArr;
    }
}