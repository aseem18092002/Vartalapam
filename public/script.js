function toggleForms() {
  document.getElementById('signup-form').classList.toggle('hidden');
  document.getElementById('login-form').classList.toggle('hidden');
}

async function handleSignup(event) {
  event.preventDefault();
  
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;

  try {
      const response = await fetch('/api/signup', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
          alert('Signup successful!');
          toggleForms();
      } else {
          alert(data.error);
      }
  } catch (error) {
      alert('Error during signup');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
      const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
          alert('Login successful!');
          // Redirect or update UI as needed
      } else {
          alert(data.error);
      }
  } catch (error) {
      alert('Error during login');
  }
}