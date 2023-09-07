const socket = io()
const form = document.getElementById('idForm')
const botonProds = document.getElementById('botonProductos')
const table = document.getElementById('tableBody')

socket.emit('loadProducts')

socket.on('products', (products) => {
    products.forEach(element => {
        table.innerHTML += `<tr id='row${element._id}'>
        <td>${element.title}</td>
        <td>${element.description}</td>
        <td>${element.category}</td>
        <td>${element.price}</td>
        <td>${element.stock}</td>
        <td>${element.code}</td>
        <td><button onclick="deleteProduct('${element._id}')">Eliminar</button></td>
      </tr>`
    });
})

form.addEventListener('submit', (e) => {
    e.preventDefault()
    const datForm = new FormData(e.target) //Me genera un objeto iterador
    const prod = Object.fromEntries(datForm) //De un objeto iterable genero un objeto simple
    socket.emit('addProduct', prod)
    e.target.reset()
})

function deleteProduct(id) {
    socket.emit('deleteProduct', id)
}
socket.on('deleteRow', (id) => {
    const rowDeleted = document.getElementById(`row${id}`)
    rowDeleted.remove()
})