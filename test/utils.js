/**
 *
 * @param a
 * @param b
 */
const equals = (a, b) => {
    if (Array.isArray(a)) {
        a = a.sort();
    }

    if (Array.isArray(b)) {
        b = b.sort();
    }

    return JSON.stringify(a) === JSON.stringify(b);
};

module.exports = {
    equals,
};