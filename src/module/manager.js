import filter from '../utils/filter';

import CountrySearch from './modules/CountrySearch';
import ChatFilterBypass from './modules/ChatFilterBypass';
import SpamFilter from './modules/SpamFilter';
import BlockLongText from './modules/BlockLongText';
import BlockSpammers from './modules/BlockSpammers';
import LogSpam from './modules/LogSpam';
import DisableNotifs from './modules/DisableNotifs';

import CloseDMs from './modules/binds/CloseDMs';
import DMSwap from './modules/binds/DMSwap';
import QuickBlock from './modules/binds/QuickBlock';

export default {
	modules: {},
	shiftDown: false,

	add(module) {
		this.modules[module.name] = module;
	},

	init() {
		filter.init();
		window.bca.filter = filter;

		this.add(new CountrySearch());
		this.add(new ChatFilterBypass());
		this.add(new SpamFilter());
		this.add(new BlockLongText());
		this.add(new BlockSpammers());
		this.add(new LogSpam());
		this.add(new DisableNotifs());

		this.add(new CloseDMs());
		this.add(new DMSwap());
		this.add(new QuickBlock);

		this.initChatHooks();
		this.initSpamFilter();
		this.initKeybinds();
	},

	initChatHooks() {
		const oldOpen = XMLHttpRequest.prototype.open;
		const oldSend = XMLHttpRequest.prototype.send;

		const manager = this;

		XMLHttpRequest.prototype.open = function(_, url) {
			this.hookable = url.includes('chat_process.php') || url.includes('private_process.php');

			return oldOpen.apply(this, arguments);
		}

		XMLHttpRequest.prototype.send = function(body) {
			if (!this.hookable || !body || !manager.modules['Chat Filter Bypass'].enabled) {
				return oldSend.apply(this, [body]);
			}

			const bodyParams = new URLSearchParams(body);
			let content = bodyParams.get('content');
			if (!content) return oldSend.apply(this, [body]);

			content = content.split(' ')
				.map(word => word.length >= 3 ? word.split('').join('‎') : word)
				.join(' ');

			bodyParams.set('content', content);
			body = bodyParams.toString();

			return oldSend.apply(this, [body]);
		}
	},

	initSpamFilter() {
		const chatLogs = document.getElementById('chat_logs_container');

		this.observer = new MutationObserver((list) => {
			for (const mutation of list) {
				if (mutation.type !== 'childList') continue;

				mutation.addedNodes.forEach(node => {
					if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'LI') {
						const msg = node.querySelector('.chat_message');
						if (!msg) return;

						const avs = node.querySelector('.avtrig.avs_menu.chat_avatar');
						const userId = avs ? avs.getAttribute('data-id') : null;

						const msgText = msg.textContent.trim().toLowerCase().replace(filter.filRegex, '');
						const detected = filter.hasBadWord(msgText);

						if (this.modules['Remove Spam Messages'].enabled && detected) {
							node.remove();

							if (this.modules['Log Spam Messages'].enabled)
								console.log(`removed: "${msgText}" due to: "${detected}"`);

							if (this.modules['Block Spammers'].enabled && userId)
								ignoreUser(parseInt(userId));

							return;
						}

						if (this.modules['Remove Long Messages'].enabled && msgText.length >= 200) {
							node.remove();

							if (this.modules['Log Spam Messages'].enabled)
								console.log(`removed: "${msgText.slice(0, 50)}..." due to having more than 200 characters (${msgText.length})`);

							if (this.modules['Block Spammers'].enabled && userId)
								ignoreUser(parseInt(userId));

							return;
						}
					}
				});
			}
		});

		this.observer.observe(chatLogs, {
			childList: true,
			subtree: true
		});
	},

	initKeybinds() {
		const keyUp = (e) => {
			if (e.code === 'ShiftRight') return;
			this.shiftDown = false;
		}

		const keyDown = (e) => {
			if (e.code !== 'ShiftRight') return;
			this.shiftDown = true;
		}

		const bindDown = (e) => {
			for (const bind in this.modules) {
				const bindObj = this.modules[bind];
				if (bindObj.type !== 'Bind') continue;

				const bindKey = bindObj.bind?.length > 1 ? bindObj.bind : 'Key'.concat(bindObj.bind);
				if (e.code === bindKey && this.shiftDown) bindObj.onClicked();
			}
		}

		document.addEventListener('keyup', keyUp);
		document.addEventListener('keydown', keyDown);
		document.addEventListener('keydown', bindDown);
	}
};