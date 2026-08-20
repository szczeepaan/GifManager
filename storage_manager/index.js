const DIR_GIFS = "storage/gif"
const DIR_STORAGE = "storage/storage.json"

const express = require('express')
const fs = require("fs")
const app = express()
const port = 3000

app.use(express.urlencoded({
    extended: true
}))

app.use(express.static("storage/gif"))

app.get('/', (req, res) => {
    let gif_files = fs.readdirSync(DIR_GIFS)
    let current_storage = fs.readFileSync(DIR_STORAGE).toString()
    if (current_storage == "" || !JSON.parse(current_storage))
        current_storage = []
    else
        current_storage = JSON.parse(current_storage)

    let result = fs.readFileSync("storage_manager/assets/index.html").toString()

    let files_in_storage = []
    let in_storage_rows = ""
    current_storage.forEach((gif) => {
        let row = fs.readFileSync("storage_manager/assets/gif_row.html").toString()
        
        row = row.replaceAll("{{filename}}", gif.filename)
        row = row.replace("{{tags}}", gif.tags)
        row = row.replace("{{category}}", gif.category)
        row = row.replace("{{nsfw}}", gif.nsfw ? "checked" : "")

        in_storage_rows += row
        files_in_storage.push(gif.filename)
    })

    let files_not_in_storage = gif_files.filter(item => !files_in_storage.includes(item))
    let not_in_storage_rows = ""
    files_not_in_storage.forEach((file) => {
        let row = fs.readFileSync("storage_manager/assets/gif_row.html").toString()

        row = row.replaceAll("{{filename}}", file)
        row = row.replace("{{tags}}", "")
        row = row.replace("{{category}}", "")
        row = row.replace("{{nsfw}}", "")

        not_in_storage_rows += row
    })

    result = result.replace("{{in_storage}}", in_storage_rows)
    result = result.replace("{{not_in_storage}}", not_in_storage_rows)
    if (not_in_storage_rows == "")
        result = result.replaceAll("{{hide}}", `style="display: none"`)

    res.type("html")
    res.send(result)
})

app.post("/save_storage", (req, res) => {
    let data = req.body
    /*
        data is an array of items of the following structure:
        filename: [
            0: tags
            1: category
            2: nsfw flag (TRUE if this field is defined and has value "on", FALSE if value is undefined)
        ]
    */

    let result = ""
    let files = []
    Object.keys(data).forEach(filename => {
        values = data[filename]
        let file = {
            filename: filename,
            tags: values[0],
            category: values[1],
            nsfw: values[2] != undefined ? true : false
        }
        files.push(file)
    })

    files.sort((a, b) => {
        if (a.filename < b.filename)
            return -1
        else if (a.filename > b.filename)
            return 1
        return 0
    })

    files_json = JSON.stringify(files)
    fs.writeFileSync(DIR_STORAGE, files_json)

    // res.send("zapisano (mam nadzieje)")
    res.redirect("\\")
})

app.listen(port, () => console.log(`App listening on port ${port}`))
