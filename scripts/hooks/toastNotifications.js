function toastNotifications() {
  return {
    notifications: [],
    displayDuration: 3000,
    soundEffect: false,

    addNotification({ variant = 'info', sender = null, title = null, message = null}) {
      const id = Date.now()
      const notification = { id, variant, sender, title, message }

      if (this.notifications.length >= 20) {
        this.notifications.splice(0, this.notifications.length - 19)
      }

      this.notifications.push(notification)

      if (this.soundEffect) {
        const notificationSound = new Audio('https://res.cloudinary.com/ds8pgw1pf/video/upload/v1728571480/penguinui/component-assets/sounds/ding.mp3')
        notificationSound.play().catch((error) => {
          console.error('Error playing the sound:', error)
        })
      }
    },

    removeNotification(id) {
      setTimeout(() => {
        this.notifications = this.notifications.filter(
          (notification) => notification.id !== id,
        )
      }, 400);
    },
  }
}