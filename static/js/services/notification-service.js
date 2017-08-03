const NotificationService = (function () {

	function create() {
		let notificationService = {};
		bind(notificationService);
		notificationService.init();
		return notificationService;
	}

	function bind(notificationService) {
		notificationService.init = init.bind(notificationService);
		notificationService.attachEvents = attachEvents.bind(notificationService);
		notificationService.onPush = onPush.bind(notificationService);
		notificationService.attachEvents = attachEvents.bind(notificationService);
		notificationService.onNotificationClick = onNotificationClick.bind(notificationService);
		notificationService.getOrOpenWindow = getOrOpenWindow.bind(notificationService);
	}

	function init() {
		this.attachEvents();
	}

	function attachEvents() {
		self.addEventListener("push", this.onPush);
		self.addEventListener("notificationclick", this.onNotificationClick);
	}

	async function onPush(e) {
		const textValue = await e.data.text();
		const [value, isObject] = jsonOrString(textValue);

		let notificationOptions;
		if (isObject) {
			switch (value.type) {
				case "call":
					notificationOptions = {
						actions: [
							{
								action: "accept",
								title: "Accept"
							},
							{
								action: "cancel",
								title: "Ignore"
							}
						],
						body: `Incoming connection from ${value.from}`,
						data: { sdp: value.sdp, from : value.from }
					};
					break;
				case "reply":
					notificationOptions = {
						actions: [
							{
								action: "accept",
								title: "Accept"
							},
							{
								action: "cancel",
								title: "Cancel"
							}
						],
						body: `Incoming response from ${value.from}`,
						data: { sdp: value.sdp, from : value.from }
					};
					break;
				default:
					notificationOptions = {
						body: "Unknown notification type",
						data: value
					};
			}
		} else {
			notificationOptions = {
				body: value
			};
		}
		const notificationPromise = self.registration.showNotification("Pushy", notificationOptions);

		e.waitUntil(notificationPromise);
	}

	async function onNotificationClick(e) {
		let promise;
		switch (e.action) {
			case "accept":
				promise = this.getOrOpenWindow("/")
					.then(w => {
						w.postMessage(Object.assign(
							{
								type: "incomingsdp"
							},
							e.notification.data
						));
					});
				e.notification.close();
				break;
			case "cancel":
				e.notification.close();
			default:
				e.notification.close();
				promise = this.getOrOpenWindow("/");
				break;
		}
		e.waitUntil(promise);
	}

	async function getOrOpenWindow(path) {
		const urlToOpen = new URL(path, self.location.origin).href;

		const windowClients = await clients.matchAll({
			type: "window",
			includeUncontrolled: true
		});
		const match = windowClients.find(wc => wc.url === urlToOpen);
		if (match) {
			await match.focus();
			return match;

		}
		const newWindow = await clients.openWindow(urlToOpen);
		return newWindow;
	}

	function jsonOrString(value) {
		try {
			const obj = JSON.parse(value);
			return [obj, true];
		} catch (ex) {
			return [value, false];
		}
	}

	return {
		create
	};

})();