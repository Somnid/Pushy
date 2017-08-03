customElements.define("persistent-textbox",
    class extends HTMLElement {
        static get observedAttributes() {
            return ["storage-key", "value", "placeholder"];
        }
        constructor() {
            super();
            this.bind(this);
            this.attrs = {};
            this.wrappedInput = document.createElement("input");
        }
        bind(element) {
            element.attachEvents = element.attachEvents.bind(element);
            element.createShadowDom = element.createShadowDom.bind(element);
            element.onInput = element.onInput.bind(element);
            element.raiseEvent = element.raiseEvent.bind(element);
        }
        connectedCallback() {
            this.createShadowDom();
            if (!this.storageKey) {
                throw "You must supply a storage key for this element";
            }
            this.attachEvents();
            this.wrappedInput.value = this.value;
            this.raiseEvent("loadedvalue", this.value);
        }
        createShadowDom() {
            this.shadow = this.attachShadow({ mode: "closed" });
            const style = document.createElement("style");
            style.innerHTML = `
                :host input { width: 100%; height: 100%; text-indent: 5px; box-sizing: border-box; }
            `;
            this.shadow.appendChild(style);
            this.shadow.appendChild(this.wrappedInput);
            this.wrappedInput.type = "text";
            this.wrappedInput.autocomplete = "off";
            this.wrappedInput.autocapitalize = "none";
            this.wrappedInput.spellcheck = false;

        }
        attachEvents() {
            this.wrappedInput.addEventListener("input", this.onInput);
        }
        onInput() {
            localStorage.setItem(this.storageKey, this.wrappedInput.value);
        }
        camelCase(text) {
            return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
        }
        raiseEvent(eventName, payload) {
            const event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, true, true);
            event.data = payload;
            this.dispatchEvent(event);
        }
        attributeChangedCallback(name, oldValue, newValue) {
            this[this.camelCase(name)] = newValue;
        }
        set storageKey(value) {
            this.attrs.storageKey = value;
        }
        get storageKey() {
            return this.attrs.storageKey;
        }
        set value(value) {
            this.wrappedInput.value = value;
        }
        get value() {
            return this.wrappedInput.value || localStorage.getItem(this.storageKey);
        }
        set placeholder(value) {
            this.wrappedInput.placeholder = value;
        }
        get placeholder() {
            return this.wappedInput.placeholder;
        }
    }
);
