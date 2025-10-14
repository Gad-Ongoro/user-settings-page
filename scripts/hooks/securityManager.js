function securityForm() {
  return {
    formData: {
      oldPassword: '',
      newPassword: '',
      repeatPassword: '',
      twoFactorAuth: 'disable'
    },
    showOldPassword: false,
    showNewPassword: false,
    showRepeatPassword: false,
    passwordMismatch: false,
    isSubmitting: false,
    successMessage: '',
    errorMessage: '',

    validatePasswords() {
      this.passwordMismatch = this.formData.newPassword !== this.formData.repeatPassword;
    },

    resetForm() {
      this.formData = {
        oldPassword: '',
        newPassword: '',
        repeatPassword: '',
        twoFactorAuth: 'disable'
      };
      this.passwordMismatch = false;
      this.successMessage = '';
      this.errorMessage = '';
      this.showOldPassword = false;
      this.showNewPassword = false;
      this.showRepeatPassword = false;
    },

    async handleSubmit() {
      this.successMessage = '';
      this.errorMessage = '';

      // passwords match
      if (this.formData.newPassword !== this.formData.repeatPassword) {
        this.errorMessage = 'New passwords do not match';
        return;
      }

      // password strength (example)
      if (this.formData.newPassword.length < 8) {
        this.errorMessage = 'Password must be at least 8 characters long';
        return;
      }

      this.isSubmitting = true;

      try {
        // API call
        const response = await fetch('/api/security/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${AuthToken}`
          },
          body: JSON.stringify({
            oldPassword: this.formData.oldPassword,
            newPassword: this.formData.newPassword,
            twoFactorAuth: this.formData.twoFactorAuth
          })
        });

        const data = await response.json();

        if (response.ok) {
          this.successMessage = 'Password changed successfully!';
          setTimeout(() => this.resetForm(), 2000);
        } else {
          this.errorMessage = data.message || 'Failed to change password';
        }
      } catch (error) {
        console.error('Error changing password:', error);
        this.errorMessage = 'An error occurred. Please try again.';
      } finally {
        this.isSubmitting = false;
      }
    }
  };
}