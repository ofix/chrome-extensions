export default class Redfish {
    static hashcode(str) {
        let hash = 0, i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;  // Convert to 32bit integer
        }
        return hash;
    }
    static searchParams(url) {
        let i = url.indexOf("?");
        if (i == -1) {
            return {};
        }
        let parts = {};
        let parameters = url.substring(i + 1);
        const PARSE_KEY = 0;
        const PARSE_VAL = 1;
        let k = "",
            v = "";
        let state = PARSE_KEY;
        for (let i = 0; i < parameters.length; i++) {
            if (state == PARSE_KEY && parameters[i] != "=") {
                k += parameters[i];
            }
            if (state == PARSE_VAL) {
                v += parameters[i];
            }
            if (parameters[i] == "=") {
                state = PARSE_VAL;
            } else if (parameters[i] == "&") {
                state = PARSE_KEY;
                parts[k] = v;
                k = "";
                v = "";
            }
        }
        parts[k] = v;
        return parts;
    }
}
