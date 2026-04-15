import { useNavigate } from "react-router-dom";

export default function UploadPage() {

  const navigate = useNavigate();

  function handleUpload() {
    navigate("/dashboard");
  }

  return (
    <div>

      <h2>Upload Dataset</h2>

      <input type="file" />

      <button onClick={handleUpload}>
        Upload
      </button>

    </div>
  );
}
