/* DOM elements */
const tooltip = document.querySelector("#tooltip")
const input_search = document.querySelector("#input-search")
const input_nsfw = document.querySelector("#input-nsfw")
const theme_button = document.querySelector("#theme-button")
const gif_container = document.querySelector("#gifs")

let tooltipTimeout;

const theme_icons = {
    dark: `<path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/>`,
    light: `<path d="M565-395q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm-226.5 56.5Q280-397 280-480t58.5-141.5Q397-680 480-680t141.5 58.5Q680-563 680-480t-58.5 141.5Q563-280 480-280t-141.5-58.5ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/>`
}

search_gifs("", handle_nsfw())
handle_theme()

async function fetch_gifs() {
    let response = await fetch("../storage/storage.json")
    let data = await response.json()
    return data
}

async function search_gifs(query = "", nsfw = false) {
    query = query.trim().toLocaleLowerCase()
    gif_container.innerHTML = ""

    let data = [];
    try {
        data = JSON.parse(DATA)
    } catch (e) {
        console.warn("Could not parse DATA variable.");
    }

    data.forEach((gif) => {
        if (gif.nsfw == true && nsfw == false)
            return

        let tags = gif.tags.split(" ")
        let query_splitted = query.split(" ")

        let tag_check = tags.some((tag) => query_splitted.includes(tag))

        if (tag_check || gif.tags.includes(query) || query == "") {
            let element = document.createElement("img")
            element.classList.add("gif")
            element.src = `storage/gif/${gif.filename}`
            element.loading = "lazy" // Add native lazy loading for performance

            // copy link to clipboard on click
            element.addEventListener("click", async (e) => {
                try {
                    await navigator.clipboard.writeText(element.src);

                    // Trigger CSS animation class instead of JS intervals
                    tooltip.style.top = `${e.clientY}px`
                    tooltip.style.left = `${e.clientX}px`
                    tooltip.classList.add("show")

                    clearTimeout(tooltipTimeout)
                    tooltipTimeout = setTimeout(() => {
                        tooltip.classList.remove("show")
                    }, 1500)
                } catch (err) {
                    console.error("Failed to copy gif:", err);
                }
            })

            gif_container.appendChild(element)
        }
    })
}

function handle_theme(toggle = false) {
    let preferred = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')).matches;
    let theme = ""

    if (toggle) {
        if (theme = localStorage.getItem("theme")) {
            theme = theme == "dark" ? "light" : "dark"
        }
        else {
            theme = preferred ? "light" : "dark"
        }
    }
    else {
        if (theme = localStorage.getItem("theme")) {
            // Keep existing theme
        }
        else {
            theme = preferred ? "dark" : "light"
        }
    }

    localStorage.setItem("theme", theme)
    document.documentElement.dataset.theme = theme
    theme_button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="32px" width="32px" viewBox="0 -960 960 960">${theme_icons[theme]}</svg>`
}

function handle_nsfw() {
    if (localStorage.getItem("nsfw") == null) {
        localStorage.setItem("nsfw", false)
        input_nsfw.checked = false
        return false
    }

    let nsfw = localStorage.getItem("nsfw") == "true" ? true : false
    input_nsfw.checked = nsfw
    return nsfw
}

/* Event listeners */
input_search.addEventListener("input", () => search_gifs(input_search.value, handle_nsfw()))
input_nsfw.addEventListener("change", (e) => {
    let checked = e.currentTarget.checked
    localStorage.setItem("nsfw", checked)
    search_gifs(input_search.value, checked)
})
theme_button.addEventListener("click", () => handle_theme(true))

// auto focus to input
window.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
        input_search.value = ""
        input_search.focus()
        search_gifs("", handle_nsfw())
    }

    if (
        (e.key.charCodeAt(0) >= 48 && e.key.charCodeAt(0) <= 57) ||
        (e.key.charCodeAt(0) >= 65 && e.key.charCodeAt(0) <= 90) ||
        (e.key.charCodeAt(0) >= 97 && e.key.charCodeAt(0) <= 122)
    ) {
        if (document.activeElement !== input_search) {
            input_search.focus()
        }
    }
})
