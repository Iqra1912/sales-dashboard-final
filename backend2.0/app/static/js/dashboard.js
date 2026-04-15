const fileInput = document.getElementById("fileUpload")

fileInput.addEventListener("change", function(){

    const file = this.files[0]

    if(!file){
        return
    }

    const formData = new FormData()
    formData.append("file", file)

    fetch("/api/upload",{
        method:"POST",
        body:formData
    })
    .then(res => res.json())
    .then(data => {

        alert("Dataset Imported Successfully")

        loadDashboard()

    })
    .catch(err=>{
        console.error(err)
        alert("Upload Failed")
    })

})


function exportReport(){

    window.location.href="/api/export"

}


function applyFilters(){

    const start = document.getElementById("startDate").value
    const end = document.getElementById("endDate").value

    fetch(`/api/dashboard?start=${start}&end=${end}`)
    .then(res=>res.json())
    .then(data=>{

        console.log(data)

        updateCharts(data)

    })

}


function loadDashboard(){

    fetch("/api/dashboard")
    .then(res=>res.json())
    .then(data=>{

        updateCharts(data)

    })

}


function updateCharts(data){

    const rows = data.data
    const numeric = data.numeric
    const categories = data.categories

    if(numeric.length === 0 || categories.length === 0){
        return
    }

    const numCol = numeric[0]
    const catCol = categories[0]

    const labels = rows.map(r => r[catCol])
    const values = rows.map(r => r[numCol])

    const ctx = document.getElementById("chart1").getContext("2d")

    new Chart(ctx,{
        type:"bar",
        data:{
            labels:labels,
            datasets:[{
                label:numCol,
                data:values
            }]
        }
    })

    showInsights(data.insights)

}
function showInsights(insights){

    const list = document.getElementById("insightsList")

    list.innerHTML = ""

    insights.forEach(i => {

        const li = document.createElement("li")
        li.innerText = i

        list.appendChild(li)

    })

}
