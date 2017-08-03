customElements.define("chat-box", 
    class extends HTMLElement {
        static get observedAttributes(){
            return [];
        }
        constructor(){
            super();
            this.bind(this);
        }
        bind(element){
            element.createShadowDom = element.createShadowDom.bind(element);
            element.cacheDom = element.cacheDom.bind(element);
            element.attachEvents = element.attachEvents.bind(element);
            element.raiseEvent = element.raiseEvent.bind(element);
            element.onMessage = element.onMessage.bind(element);
            element.sendMessage = element.sendMessage.bind(element);
        }
        connectedCallback(){
            this.createShadowDom();
            this.cacheDom();
            this.attachEvents();
        }
        createShadowDom(){
            this.shadow = this.attachShadow({ mode : "closed" });
            this.shadow.innerHTML = `
                <style>
                    :host .message-list { border: 1px solid #ccc; min-height: 60px; padding: 5px; background: #efefef; margin-bottom: 10px; }
                </style>
                <div class="message-list"></div>
                <div class="row">
                    <input type="text" class="input">
                    <button class="send">Send</div>
                </div>
            `;   
        }
        cacheDom(){
            this.dom = {};
            this.dom.sendButton = this.shadow.querySelector(".send");
            this.dom.input = this.shadow.querySelector("input");
            this.dom.messageList = this.shadow.querySelector(".message-list");
        }
        attachEvents(){
            this.dom.sendButton.addEventListener("click", this.sendMessage);
            Bus.static.subscribe("message", this.onMessage);
        }
        raiseEvent(eventName, payload){
            const event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, true, true);
            event.data = payload;
            this.dispatchEvent(event);
        }
        sendMessage(){
            const value = this.dom.input.value;
            this.raiseEvent("send", { type: "message", value });
            const messageElement = document.createElement("chat-bubble");
            messageElement.content = value;
            messageElement.direction = "to";
            this.dom.messageList.appendChild(messageElement);
            this.dom.input.value = "";
        }
        onMessage(message){
            if(message.type !== "message"){
                return;
            }
            const messageElement = document.createElement("chat-bubble");
            messageElement.content = message.value;
            messageElement.direction = "from";
            messageElement.sender = message.from;
            this.dom.messageList.appendChild(messageElement);
        }
    }
)