const gif_container = document.querySelector("#gifs")

GIF.forEach((gif) => {
    gif_container.innerHTML += `<img class="gif" src="storage/gif/${gif}" />`
})
