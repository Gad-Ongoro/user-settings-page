function deleteAccountManager() {
	return {
		// ======  delete account  ======
		showDelAccModal: false,
		currentStep: 1,
    password: '',
		confirmations: {
			dataLoss: false,
			walletNcoinsForfeit: false,
			finalConfirm: false
		},

		get allConfirmed() {
			return this.confirmations.dataLoss && 
				this.confirmations.walletNcoinsForfeit && 
				this.confirmations.finalConfirm;
		},

		openDelAccModal() {
			this.showDelAccModal = true;
			this.currentStep = 1;
      this.password = '';
			this.resetConfirmations();
			document.body.style.overflow = 'hidden';
		},

		closeDelAccModal() {
			this.showDelAccModal = false;
			this.currentStep = 1;
			this.password = '';
			this.resetConfirmations();
			document.body.style.overflow = '';
		},

		goToStep2() {
			if (this.password) {
				this.currentStep = 2;
			}
		},

		goToStep1() {
			this.currentStep = 1;
		},

		resetConfirmations() {
			this.confirmations = {
				dataLoss: false,
				walletNcoinsForfeit: false,
				finalConfirm: false
			};
		},

		deleteAccount() {
			if (this.allConfirmed) {
				// API call to delete account
				alert('Account Deleted!');
				this.closeDelAccModal();
			}
		},

		// ======  deactivate account  ======
		showDeactivateAccModal: false,
		selectedDeactivateAccountReason: '',
		deactivateAccountReasonOptions: [
			'I’m taking a break',
			'I don’t use it enough',
			'Found a bug or had technical issues',
			'Other'
		],

		openDeactModal() {
			this.showDeactivateAccModal = true;
			document.body.style.overflow = 'hidden';
		},

		closeDeactivateModal() {
			this.showDeactivateAccModal = false;
			document.body.style.overflow = '';
		},

		deactivateAccount() {
			// API call to deactivate account
			alert('Account Deactivated!');
			this.closeDeactivateModal();
		},
	}
}
