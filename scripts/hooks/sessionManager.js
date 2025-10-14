function sessionManager() {
	return {
		showModal: false,
		showSessionsModal: false,
		selectedDevice: null,
		devices: [
			{
				id: 1,
				name: 'MacBook',
				type: 'laptop',
				browser: 'Google Chrome',
				lastActive: '10s ago',
				location: 'Lagos, Nigeria',
				current: true
			},
		],
		loading: true,

		async init() {
			await this.loadDevices();
			this.loading = false;
		},

		async loadDevices() {
      const currentDevice = await this.getCurrentDeviceInfo();

      // Load stored devices from session/local storage
      const storedDevices = this.getStoredDevices();
                    
      // Update or add current device
      const existingIndex = storedDevices.findIndex(d => d.id === currentDevice.id);
			if (existingIndex >= 0) {
				storedDevices[existingIndex] = currentDevice;
			} else {
				storedDevices.unshift(currentDevice);
			}

			// Save updated devices
			this.saveDevices(storedDevices);

			// Set devices with current device marked
			this.devices = storedDevices.map(device => ({
				...device,
				isCurrent: device.id === currentDevice.id,
				lastActive: this.formatLastActive(device.lastActiveTime)
			}));
		},

		async getCurrentDeviceInfo() {
			const ua = navigator.userAgent;
			const deviceInfo = this.parseUserAgent(ua);

			// location
			let location = 'Unknown location';
			try {
				const response = await fetch('https://ipapi.co/json/');
				const data = await response.json();
				location = `${data.city}, ${data.country_name}`;
			} catch (error) {
				console.log('[v0] Failed to fetch location:', error);
			}

			// unique device ID
			const deviceId = this.generateDeviceId(ua);

			return {
				id: deviceId,
				name: this.getDeviceName(deviceInfo),
				type: deviceInfo.type,
				browser: deviceInfo.browser,
				os: deviceInfo.os,
				location: location,
				lastActiveTime: Date.now(),
				lastActive: 'Just now'
			};
		},

		parseUserAgent(ua) {
      // device type
			let type = 'laptop';
			if (/Mobile|Android|iPhone|iPod/i.test(ua)) {
				type = 'phone';
			} else if (/iPad|Tablet/i.test(ua)) {
				type = 'tablet';
			}

			// browser
			let browser = 'Unknown Browser';
			if (ua.includes('FxiOS')) {
				browser = 'Firefox (iOS)';
			} else if (ua.includes('EdgiOS')) {
				browser = 'Edge (iOS)';
			} else if (ua.includes('CriOS')) {
				browser = 'Chrome (iOS)';
			} else if (ua.includes('OPiOS')) {
				browser = 'Opera (iOS)';
			} else if (ua.includes('Firefox')) {
				browser = 'Firefox';
			} else if (ua.includes('Edg')) {
				browser = 'Edge';
			} else if (ua.includes('Chrome')) {
				browser = 'Chrome';
			} else if (ua.includes('Safari')) {
				browser = 'Safari';
			} else if (ua.includes('Opera') || ua.includes('OPR')) {
				browser = 'Opera';
			}

			// OS
			let os = 'Unknown OS';
			if (ua.includes('Android')) {
				os = 'Android';
			} else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iOS')) {
				os = 'iOS';
			} else if (ua.includes('Windows')) {
				os = 'Windows';
			} else if (ua.includes('Mac OS')) {
				os = 'macOS';
			} else if (ua.includes('Linux')) {
				os = 'Linux';
			}

			return { type, browser, os };
		},

		getDeviceName(deviceInfo) {
			const { type, browser, os } = deviceInfo;
			if (type === 'phone') return `${os} Phone`;
			if (type === 'tablet') return `${os} Tablet`;
			return `${os} ${browser}`;
		},

		generateDeviceId(ua) {
			// unique ID based on user agent and screen resolution
			const screenInfo = `${window.screen.width}x${window.screen.height}`;
			const combined = ua + screenInfo;

			let hash = 0;
			for (let i = 0; i < combined.length; i++) {
				const char = combined.charCodeAt(i);
				hash = ((hash << 5) - hash) + char;
				hash = hash & hash;
			}
			return Math.abs(hash).toString(36);
		},

		formatLastActive(timestamp) {
			const now = Date.now();
			const diff = now - timestamp;
			
			const minutes = Math.floor(diff / 60000);
			const hours = Math.floor(diff / 3600000);
			const days = Math.floor(diff / 86400000);
			
			if (minutes < 1) return 'Just now';
			if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
			if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
			return `${days} day${days > 1 ? 's' : ''} ago`;
		},

		getStoredDevices() {
			try {
				const stored = sessionStorage.getItem('tracked_devices');
				return stored ? JSON.parse(stored) : [];
			} catch (error) {
				console.log('[v0] Failed to load stored devices:', error);
				return [];
			}
		},

		saveDevices(devices) {
			try {
				sessionStorage.setItem('tracked_devices', JSON.stringify(devices));
			} catch (error) {
				console.log('[v0] Failed to save devices:', error);
			}
		},

		removeDevice(deviceId) {
			this.devices = this.devices.filter(d => d.id !== deviceId);
			const storedDevices = this.devices.map(d => ({
				id: d.id,
				name: d.name,
				type: d.type,
				browser: d.browser,
				os: d.os,
				location: d.location,
				lastActiveTime: d.lastActiveTime
			}));
			this.saveDevices(storedDevices);
		},


		// modals
		openLogoutModal(device) {
			this.selectedDevice = device;
			this.showModal = true;
			document.body.style.overflow = 'hidden';
		},

		openSessionsModal() {
			this.showSessionsModal = true;
			document.body.style.overflow = 'hidden';
		},

		closeModal() {
			this.showModal = false;
			this.showSessionsModal = false;
			this.selectedDevice = null;
			document.body.style.overflow = '';
		},

		confirmLogout() {
			this.devices = this.devices.filter(d => d.id !== this.selectedDevice.id);
			this.closeModal();

			console.log('Logged out from:', this.selectedDevice.name);
		},

		confirmLogoutAll() {
			this.devices = [];
			this.closeModal();

			console.log('Logged out from all devices');
		}
	}
}