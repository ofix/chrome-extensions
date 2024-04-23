export default class FormScreenshot {
    constructor(fields) {
        this.created_at = this.now();
        this.fields = fields;
    }
    now() {
        let year = date.getFullYear(),
            month = date.getMonth() + 1, // months are zero indexed
            day = date.getDate(),
            hour = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds();

        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }
        if (hour < 10) {
            hour = '0' + hour;
        }
        if (second < 10) {
            second = '0' + second;
        }
        if (minute < 10) {
            minute = "0" + minute;
        }
        return month + "-" + day + "-" + year + " " + hour + ":" +
            minute + second;
    }
    buildHtml() {
        return `
        <div class="dragon-screenshot">
         
        </div>
       `;
    }
    buildJson() {

    }
};