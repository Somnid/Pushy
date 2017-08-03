//Once created call either connect() for a new session, or loadSdp() to connect to an open session
//onSdpUpdated will fire when the sdp generation is finished, use this event to decide when to send sdp to signalling channel
//onNewIce will give back new ice candidates for trickle ice
const RtcConnector = (function(){

    const defaults = {
        log: false,
        iceServers: [],
        onNewIce: () => {},
        onChannelOpen: () => {},
        onChannelClose: () => {},
        onChannelMessage: () => {}
    };

    function create(options){
        const rtcConnector = {};
        rtcConnector.options = Object.assign({}, defaults, options);
        bind(rtcConnector);
        rtcConnector.init();
        return rtcConnector;
    }

    function bind(rtcConnector){
        rtcConnector.init = init.bind(rtcConnector);
        rtcConnector.connect = connect.bind(rtcConnector);
        rtcConnector.sdpChanged = sdpChanged.bind(rtcConnector);
        rtcConnector.loadSdp = loadSdp.bind(rtcConnector);
        rtcConnector.attachEvents = attachEvents.bind(rtcConnector);
        rtcConnector.gotDataChannel = gotDataChannel.bind(rtcConnector);
        rtcConnector.gotIceCandidate = gotIceCandidate.bind(rtcConnector);
        rtcConnector.log = log.bind(rtcConnector);

        rtcConnector.attachDataChannelEvents = attachDataChannelEvents.bind(rtcConnector);
        rtcConnector.onChannelOpen = onChannelOpen.bind(rtcConnector);
        rtcConnector.onChannelClose = onChannelClose.bind(rtcConnector);
        rtcConnector.onChannelMessage = onChannelMessage.bind(rtcConnector);
        rtcConnector.onChannelError = onChannelError.bind(rtcConnector);
    }

    function init(){
        this.iceDone = false;
        this.spdExchangeDone = false;
        this.peerConnection = new RTCPeerConnection({
            iceServers : this.options.iceServers
        });
        this.sdpReady = new Promise((res, rej) => { 
            this.resolveSdp = res;
        });
        this.attachEvents();
        this.log("RtcConnector created.");
    }

    function attachEvents(){
        this.peerConnection.addEventListener("datachannel", this.gotDataChannel);
        this.peerConnection.addEventListener("icecandidate", this.gotIceCandidate);
    }

    function attachDataChannelEvents(dataChannel){
        dataChannel.addEventListener("open", this.onChannelOpen);
        dataChannel.addEventListener("close", this.onChannelClose);
        dataChannel.addEventListener("message", this.onChannelMessage);
        dataChannel.addEventListener("error", this.onChannelError);
    }

    function gotDataChannel(e){
        this.log("Got a data channel.", e.channel);
        this.dataChannel = e.channel;
        this.attachDataChannelEvents(this.dataChannel);
    }

    function gotIceCandidate(e){
        if(!e.candidate){
            this.iceDone = true;
        }
        this.options.onNewIce(e.candidate);
        this.sdpChanged();
    }

    async function connect(){
        this.dataChannel = this.peerConnection.createDataChannel("data", {
            reliable: true
        });
        this.attachDataChannelEvents(this.dataChannel);
        const sessionDescription = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(sessionDescription);
        this.log("As initiator, set local description.", sessionDescription);
        this.sdpChanged();
    }

    function sdpChanged(){
        if(this.iceDone && this.peerConnection.localDescription.type){
            this.log("Sdp generation complete");
            this.resolveSdp(this.peerConnection.localDescription);
        }
    }

    async function loadSdp(sdp){
        const remoteDescription = new RTCSessionDescription(sdp);
        await this.peerConnection.setRemoteDescription(remoteDescription);
        this.log("Set remote description", remoteDescription);

        if(!this.peerConnection.localDescription.sdp){
            const localDescription = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(localDescription);
            this.log("As receiver, set local description", localDescription);
            this.sdpChanged();
        }else {
            this.sdpExchangeDone = true;
        }
        return this;
    }

    //channel methods
    function onChannelOpen(){
        this.log("Data channel opened", this.dataChannel);
        this.options.onChannelOpen(this.dataChannel);
    }

    function onChannelClose(){
        this.log("Data channel closed", this.dataChannel);
        this.options.onChannelClose(this.dataChannel);
    }

    function onChannelMessage(e){
        this.options.onChannelMessage(JSON.parse(e.data));
    }

    function onChannelError(e){
        console.error(e);
    }

    //utility

    function log(...args){
        if(this.options.log){
            console.log(...args);
        }
    }

    return {
        create
    };

})();