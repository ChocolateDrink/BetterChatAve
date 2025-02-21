import gui from './gui/gui'
import manager from './module/manager';

class Main {
	constructor() {
		this.init();
	}

	init() {
		gui.init();
		manager.init();

		window.bca = {};
		window.bca.modules = manager.modules;
		window.bca.gui = gui;
	}
};

export default new Main()
