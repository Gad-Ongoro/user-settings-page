function apiHandler() {
  return {
    loading: false,
    async callApi() {
      this.loading = true;
      try {
        const response = await fetch('https://dev.supabase.co/functions/v1/status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        window.dispatchEvent(new CustomEvent('notify', {
          detail: {
            variant: 'success',
            title: 'Success!',
            message: 'Your changes have been saved!',
          }
        }));
      } catch (error) {
        console.error('Fetch error:', error);
        window.dispatchEvent(new CustomEvent('notify', {
          detail: {
            variant: 'danger',
            title: 'Oops!',
            message: 'Something went wrong while saving your changes.',
          }
        }));
      } finally {
        this.loading = false;
      }
    }
  }
}
