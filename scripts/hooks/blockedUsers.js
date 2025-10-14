function blockedUsersManager() {
	return {
		showModal: false,
		selectedUser: null,
    searchQuery: '',
		blockedUsers: [
			{
				id: 1,
				name: 'Don John',
				username: '@donjohn',
        profile_img: 'https://i.pinimg.com/736x/26/cf/47/26cf4792065d7b5da949c48a002d4f49.jpg',
			},
      {
        id: 2,
        name: 'John Doe',
        username: '@johndoe',
        profile_img: 'https://i.pinimg.com/736x/26/cf/47/26cf4792065d7b5da949c48a002d4f49.jpg',
      },
      {
        id: 3,
        name: 'Doe Jane',
        username: '@donjane',
        profile_img: 'https://i.pinimg.com/736x/26/cf/47/26cf4792065d7b5da949c48a002d4f49.jpg',
      },
      {
				id: 4,
				name: 'Jane Doe',
				username: '@janedoe',
        profile_img: 'https://i.pinimg.com/736x/26/cf/47/26cf4792065d7b5da949c48a002d4f49.jpg',
			},
      {
        id: 5,
        name: 'Don John',
        username: '@donjohn',
        profile_img: 'https://i.pinimg.com/736x/26/cf/47/26cf4792065d7b5da949c48a002d4f49.jpg',
      },
      {
        id: 6,
        name: 'Don John',
        username: '@donjohn',
        profile_img: 'https://i.pinimg.com/736x/26/cf/47/26cf4792065d7b5da949c48a002d4f49.jpg',
      }
		],

    // search
    get filteredUsers() {
      if (!this.searchQuery) {
        return this.blockedUsers;
      }

      const query = this.searchQuery.toLowerCase();
      return this.blockedUsers.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.username.toLowerCase().includes(query)
      );
    },

		openBlockedUserModal(user) {
			this.selectedUser = user;
			this.showModal = true;
			document.body.style.overflow = 'hidden';
		},

		closeBlockedUserModal() {
			this.showModal = false;
			this.selectedUser = null;
			document.body.style.overflow = '';
		},

		confirmUnblock() {
			this.blockedUsers = this.blockedUsers.filter(d => d.id !== this.selectedUser.id);
			this.closeBlockedUserModal();

      window.dispatchEvent(new CustomEvent('notify', {
        detail: {
          variant: 'success',
          title: 'Success!',
          message: `User Unblocked!`,
        }
      }));
		}
	}
}
