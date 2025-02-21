import Module from '../base';

export default class ChatFilterBypass extends Module {
	constructor() {
		super('Chat Filter Bypass', 'Toggle')
	}

	onEnabled() {
		const self = this;

		self.oldOpen = XMLHttpRequest.prototype.open;
		self.oldSend = XMLHttpRequest.prototype.send;

		XMLHttpRequest.prototype.open = function(_, url) {
			this.hookable = url.includes('chat_process.php') || url.includes('private_process.php');

			return self.oldOpen.apply(this, arguments);
		}

		XMLHttpRequest.prototype.send = function(body) {
			if (!this.hookable || !body) {
				return self.oldSend.apply(this, [body]);
			}

			const bodyParams = new URLSearchParams(body);
			let content = bodyParams.get('content');
			if (!content) return self.oldSend.apply(this, [body]);

			content = content.split(' ')
				.map(word => word.length >= 3 ? word.split('').join('‎') : word)
				.join(' ');

			bodyParams.set('content', content);
			body = bodyParams.toString();

			return self.oldSend.apply(this, [body]);
		}
	}

	onDisabled() {
		XMLHttpRequest.prototype.open = this.oldOpen;
		XMLHttpRequest.prototype.send = this.oldSend;

		this.oldOpen = null;
		this.oldSend = null;
	}
};
