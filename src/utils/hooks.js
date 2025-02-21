export default {
	hooked: {},

	hookNotifis(unhook) {
		if (unhook) {
			if (!this.hooked.callSuccess)
				return;

			callSuccess = this.hooked.callSuccess;
			delete this.hooked.callSuccess;
			return;
		}

		this.hooked.callSuccess = callSuccess;
		callSuccess = () => {};
	},

	hookCloseRight() {
		const oldCloseRight = closeRight;

		closeRight = () => {
			prepareRight(0);
			userReload(1);

			closeRight = oldCloseRight;
		};	
	}
};
