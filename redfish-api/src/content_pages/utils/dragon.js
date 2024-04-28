export default class dragon {
    static async get(url) {
        let response = await fetch(this.proxy_server + url, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "get"
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Network response error!");
        }
    }
    static async post(url, payload) {
        let response = await fetch(this.proxy_server + url, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "post",
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Network response error!");
        }
    }
    static async patch(url, payload) {
        let response = await fetch(this.proxy_server + url, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "patch",
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Network response error!");
        }
    }
    static async put(url, payload) {
        let response = await fetch(this.proxy_server + url, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "put",
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Network response error!");
        }
    }
    static async delete(url, payload) {
        let response = await fetch(this.proxy_server + url, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "delete",
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Network response error!");
        }
    }
}