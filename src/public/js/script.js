/*const socket = io()

socket.emit('mensajeConexion', { user: "Francisco", rol: "User" })

socket.on('credencialesConexion', (info) => {
    console.log(info)
})*/

const socket = io()

const botonChat = document.getElementById('botonChat')
const parrafosMensajes = document.getElementById('parrafosMensajes')
const valInput = document.getElementById('chatBox')
let email

Swal.fire({
    title: "Identificacion de usuario",
    text: "Por favor ingrese su correo",
    input: "text",
    inputValidator: (valor) => {
        return !valor && "Ingrese su nombre de usuario valido"
    },
    allowOutsideClick: false
}).then(resultado => {
    email = resultado.value
    console.log(email)
})

socket.emit('loadMessages')

botonChat.addEventListener('click', (e) => {
    e.preventDefault()
    let fechaActual = new Date().toLocaleString()

    if (valInput.value.trim().length > 0) {
        socket.emit('mensaje', { email: email, message: valInput.value })
        valInput.value = ""
    }
})

socket.on('mensajes', (arrayMensajes) => {
    parrafosMensajes.innerHTML = ""
    arrayMensajes.forEach(mensaje => {
        parrafosMensajes.innerHTML += `<p>${mensaje.postTime}: el usuario ${mensaje.email} escribio ${mensaje.message} </p>`
    })
})