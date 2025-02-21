import ChatFilterBypass from './modules/ChatFilterBypass';
import CountrySearch from './modules/CountrySearch';

export default {
	modules: {},

	add(module) {
		this.modules[module.name] = module;
	},

	init() {
		this.add(new CountrySearch());
		this.add(new ChatFilterBypass());
	}
};