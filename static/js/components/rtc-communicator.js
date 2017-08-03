customElements.define("rtc-communicator",
    class extends HTMLElement {
        static get observedAttributes() {
            return ["username"];
        }
        constructor() {
            super();
            this.bind(this);
            this.state = new Proxy({
                connectionStatus: "none",
            }, { set: this.setState });
            this.init();
        }
        bind(element) {
            element.init = element.init.bind(element);
            element.attachEvents = element.attachEvents.bind(element);
            element.cacheDom = element.cacheDom.bind(element);
            element.offer = element.offer.bind(element);
            element.answer = element.answer.bind(element);
            element.setState = element.setState.bind(element);
            element.render = element.render.bind(element);
            element.log = element.log.bind(element);

            element.sendChat = element.sendChat.bind(element);
            element.onChannelOpen = element.onChannelOpen.bind(element);
            element.onChannelClose = element.onChannelClose.bind(element);
            element.onChannelError = element.onChannelError.bind(element);
            element.onChannelMessage = element.onChannelMessage.bind(element);
        }
        init() {
            this.options = { log: true };
            this.createShadowDom();
            this.cacheDom();
            this.attachEvents();
            this.rtcConnection = RtcConnector.create({
                iceServers: [
                    { url: 'stun:stun.l.google.com:19302' }
                ],
                log: true,
                onChannelOpen: this.onChannelOpen,
                onChannelClose: this.onChannelClose,
                onChannelError: this.onChannelError,
                onChannelMessage: this.onChannelMessage
            });
            this.rtcConnection.sdpReady.then(this.offer);
        }
        createShadowDom(){
            this.shadow = this.attachShadow({ mode : "closed" });
            this.shadow.innerHTML = `
                <style>
                    #connect-button { margin-right: 10px; }
                    .row { display: flex; flex-flow: row nowrap; margin-bottom: 10px; }
                    .status-indicator { height: 20px; width: 20px; border-radius: 10px; border: 1px solid #000; }
                    .status-indicator.go { background: green; }
                    .status-indicator.progress { background: yellow; }
                    .status-indicator.error { background: red; }
                    .status-indicator.none { background: #ccc; }
                </style>
                <div class="row">
					<button id="connect-button">Connect</button>
					<div class="status-indicator none"></div>
				</div>
				<chat-box></chat-box>
            `;
        }
        cacheDom() {
            this.dom = {};
            this.dom.connectButton = this.shadow.querySelector("#connect-button");
            this.dom.connectionStatus = this.shadow.querySelector(".status-indicator");
            this.dom.chatBox = this.shadow.querySelector("chat-box");
        }

        async offer(sdp) {
            this.log("Pushing local sdp to signaling channel");
            if (sdp.type !== "offer") {
                return;
            }
            this.raiseEvent("offer", {
                sdp
            });
        }
        async answer(remoteSdp) {
            this.log("Getting remote sdp from signaling channel");
            const localSdp = await (await this.rtcConnection.loadSdp(remoteSdp)).sdpReady;
            if (!this.rtcConnection.sdpExchangeDone) {
                this.raiseEvent("answer", {
                    sdp: localSdp
                });
            }
        }
        attachEvents() {
            this.dom.connectButton.addEventListener("click", e => {
                this.state.connectionStatus = "progress";
                this.rtcConnection.connect()
            });
            this.dom.chatBox.addEventListener("send", this.sendChat);
            Bus.static.subscribe("message", e => {
                if(e.type === "incomingsdp"){
                    this.answer(e.sdp);
                }
            });

        }
        sendChat(e) {
            this.log("Sending chat", e.data);
            const packet = Object.assign({}, e.data, { from: this.username });
            this.rtcConnection.dataChannel.send(JSON.stringify(packet));
        }
        onChannelOpen() {
            this.state.connectionStatus = "go";
        }
        onChannelClose() {
            this.state.connectionStatus = "none";
        }
        onChannelError() {
            this.state.connectionStatus = "error";
        }
        onChannelMessage(value) {
            this.log("Got message", value);
            Bus.static.emit("message", value);
        }
        setState(target, key, value) {
            if (target[key] !== value) {
                requestAnimationFrame(this.render);
            }
            return Reflect.set(target, key, value);
        }
        render() {
            ["go", "progress", "error", "none"].forEach(c => this.dom.connectionStatus.classList.toggle(c, c === this.state.connectionStatus));
        }
        attributeChangedCallback(name, oldValue, newValue) {
            this[name] = newValue;
        }
        raiseEvent(eventName, payload){
            const event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, true, true);
            event.data = payload;
            this.dispatchEvent(event);
        }
        log(...args) {
            if (this.options.log) {
                console.log(...args);
            }
        }
    }
);