import React from "react";
import API from "../api/api";

function UploadDataset() {

  const handleUpload = async (event) => {

    const file = event.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    const res = await API.post("/upload", formData);

  };

  return (
    <input type="file" onChange={handleUpload} />
  );
}

export default UploadDataset;
