class Utils {
    static buildWhereQuery(where = {}) {
        let whereQuery = '';
        const sqlParams = [];

        for (let [index, [key, value]] of Object.entries(where).entries()) {
            if (index === 0) {
                whereQuery += ` WHERE ${key} IN ($${index + 1})`;
            } else {
                whereQuery += `AND ${key} IN ($${index + 1})`;
            }
            sqlParams.push(value);
        }

        return { whereQuery, sqlParams };
    }

    static identicalArray(arr1, arr2) {
        return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
    }
}

export default Utils;