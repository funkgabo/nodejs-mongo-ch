document.getElementById('loginForm')

loginForm.addEventListener('submit', (e) => {
    const datForm = new FormData(e.target) //Me genera un objeto iterador
    const user = Object.fromEntries(datForm) //De un objeto iterable genero un objeto simple
})