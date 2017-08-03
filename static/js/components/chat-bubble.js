customElements.define("chat-bubble",
    class extends HTMLElement {
        static get observedAttributes(){
            return ["direction", "content", "sender"];
        }
        constructor(){
            super();
            this.bind(this);
        }
        bind(element){
            element.createShadowDom = element.createShadowDom.bind(element);
        }
        connectedCallback(){
            this.createShadowDom();
        }
        createShadowDom(){
            this.shadow = this.attachShadow({ mode : "closed" });
            this.shadow.innerHTML = `
                <style>
                    :host { background: #efefef; }
                    :host .line { width: 100%; display: flex; flex-flow: row nowrap; align-items: center; justify-content: flex-start; }
                    :host .line.to {  flex-direction: row-reverse; }
                    :host .message { padding: 5px; border-radius: 5px; background: white; }
                    :host .from .message {  background: blue; color: white; }
                    :host .sender { margin-right: 10px; }
                    :host .sender::after { content : ":"; }
                    :host .line.to .sender { display: none; }
                </style>
                <div class="line ${this.direction}">
                    <div class="sender">${this.sender}</div>
                    <div class="message">${this.content}</div>
                </div>
            `;   
        }
    }
);