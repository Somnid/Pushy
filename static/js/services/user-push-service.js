const UserPushService = (function () {

    function create() {
        const userPushService = {};
        bind(userPushService);
        return userPushService;
    }

    function bind(userPushService) {
        userPushService.register = register.bind(userPushService);
        userPushService.sendMessage = sendMessage.bind(userPushService);
    }

    async function register(name, data) {
        if (!data || !data) {
            return;
        }

        try {
            const result = await fetch("https://dkmhm-fuc-test0.azurewebsites.net/api/HttpTriggerCSharp1?code=TgtBznA9FKw2CD/sHRocimB8kh9aOiaxbcGwejzIQw58BKA2aeUZJA==", {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify({
                    name,
                    data
                })
            });
            console.log("Success!");
        }
        catch (ex) {
            console.log(ex);
        }
    }
    async function sendMessage(name, data) {
        if (!data || !data) {
            return;
        }

        try {
            const result = await fetch("https://dkmhm-fuc-test0.azurewebsites.net/api/PushMessage?code=TU057/lgutqb3ynd3eVVxsxS7F8Frv8MP5QUCOdbTNtUFVldV4Ov7g==", {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify({
                    name,
                    data
                })
            });
            console.log("Success!");
        }
        catch (ex) {
            console.log(ex);
        }
    }

    return {
        create
    };

})();