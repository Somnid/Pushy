const Bus = (function(){

    function create(){
        const bus = {
            channels : new Map(),
            queue : new Map()
        };
        bind(bus);
        return bus;
    }

    function bind(bus){
        bus.subscribe = subscribe.bind(bus);
        bus.emit = emit.bind(bus);
    }

    function subscribe(channelName, func){
        const channel = this.channels.get(channelName);
        if(channel){
            channel.add(func);
        } else {
            const subscribers = new Set();
            subscribers.add(func);
            this.channels.set(channelName, subscribers);
            if(this.queue.get(channelName)){
                this.queue.forEach(v => func(v));
            }
        }
    }

    function emit(channelName, value){
        let channel = this.channels.get(channelName);
        if(channel){
            channel.forEach(s => s(value));
        } else {
            const queue = this.queue.get(channelName);
            if(queue){
                queue.push(value);
            } else {
                queue.add(channelName, [value]);
            }
        }
    }

    return {
        create,
        static: create()
    };

})();