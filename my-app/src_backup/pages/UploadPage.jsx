import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const onFileChange = (e) => setFile(e.target.files[0]);

  const triggerUpload = () => {
    if (!file) return alert("Select a file first!");
    // You can either upload here or pass it to the dashboard via state
    navigate("/dashboard", { state: { pendingFile: file } });
  };

  return (
    <div className="p-10 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Upload Sales Data</h2>
      <div className="border-2 border-dashed border-slate-300 p-8 rounded-lg text-center">
        <input type="file" onChange={onFileChange} accept=".csv, .xlsx, .xls" className="mb-4" />
        <button 
          onClick={triggerUpload}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Generate Dashboard
        </button>
      </div>
    </div>
  );
}