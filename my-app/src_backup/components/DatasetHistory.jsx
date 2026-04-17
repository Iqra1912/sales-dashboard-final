import { useEffect, useState } from "react";
import API from "../api/api";

function DatasetHistory(){

const [datasets,setDatasets] = useState([]);

useEffect(()=>{
API.get("/datasets")
.then(res=>setDatasets(res.data))
},[])

return(
<div>
<h2>Datasets</h2>

{datasets.map(d=>(
<div key={d.id}>
{d.filename}
</div>
))}

</div>
)

}

export default DatasetHistory
