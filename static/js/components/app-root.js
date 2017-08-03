customElements.define("app-root",
    class extends HTMLElement {
        static get observedAttributes() {
            return [];
        }
        constructor() {
            super();
            this.bind(this);
            this.state = new Proxy({
                connectionStatus: "none",
            }, { set: this.setState });
        }
        bind(element) {
            element.attachEvents = element.attachEvents.bind(element);
            element.cacheDom = element.cacheDom.bind(element);
            element.setState = element.setState.bind(element);
            element.render = element.render.bind(element);
            element.onOffer = element.onOffer.bind(element);
            element.onAnswer = element.onAnswer.bind(element);
            element.log = element.log.bind(element);
        }
        async connectedCallback() {
            this.options = { log: true };
            this.cacheDom();
            this.attachEvents();
            this.userPushService = UserPushService.create();

            this.dom.subscribeName.addEventListener("loadedvalue", e => this.dom.rtcCommunicator.username = e.data);
        }
        cacheDom() {
            this.dom = {};
            this.dom.subscribeName = this.querySelector("#subscribe-name");
            this.dom.sendName = this.querySelector("#send-name");
            this.dom.sendMessage = this.querySelector("#send-message");
            this.dom.sendButton = this.querySelector("#send-button");
            this.dom.notificationManager = this.querySelector("notification-manager");
            this.dom.rtcCommunicator = this.querySelector("rtc-communicator");
            this.dom.connectName = this.querySelector("#connect-name");
        }

        async onOffer(e) {
            const offer = e.data;
            try {
                await this.userPushService.sendMessage(this.dom.connectName.value, JSON.stringify({
                    type: "offer",
                    from: this.dom.subscribeName.value,
                    sdp: offer.sdp
                }));
            } catch (ex) {
                console.error(ex);
            }
        }

        async onAnswer(e) {
            const answer = e.data;
            console.log("!",answer);
            try {
                this.userPushService.sendMessage(this.dom.connectName.value, JSON.stringify({
                    type: "answer",
                    from: this.dom.subscribeName.value,
                    sdp: answer.sdp
                }));
            } catch (ex) {
                console.error(ex);
            }
        }
        attachEvents() {
            this.dom.notificationManager.addEventListener("gotsubscription", e => this.userPushService.register(this.dom.subscribeName.value, JSON.stringify(e.data)));
            this.dom.sendButton.addEventListener("click", e => this.userPushService.sendMessage(this.dom.sendName.value, this.dom.sendMessage.value));
            this.dom.subscribeName.addEventListener("input", e => this.dom.rtcCommunicator.username = this.dom.subscribeName.value)
            this.dom.rtcCommunicator.addEventListener("offer", this.onOffer);
            this.dom.rtcCommunicator.addEventListener("answer", this.onAnswer);
            navigator.serviceWorker.addEventListener("message", e => Bus.static.emit("message", e.data));

        }
        setState(target, key, value) {
            if (target[key] !== value) {
                requestAnimationFrame(this.render);
            }
            return Reflect.set(target, key, value);
        }
        render() {

        }
        attributeChangedCallback(name, oldValue, newValue) {
            this[name] = newValue;
        }
        log(...args) {
            if (this.options.log) {
                console.log(...args);
            }
        }
    }
);
