function askData(){

    const question = document.getElementById("chatQuestion").value

    fetch("/api/ask",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({question:question})
    })
    .then(res=>res.json())
    .then(data=>{

        addMessage("AI", data.answer)

    })
async function uploadFile() {

    const fileInput = document.getElementById("fileInput")
    const file = fileInput.files[0]

    let formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
    })

    const data = await response.json()

    generateChart(data.chart)
}

}
