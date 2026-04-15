//const API = "http://localhost:5000/api";

export const getCharts = async () => {
  const res = await fetch(`${API}/charts`);
  return res.json();
};

export const getTopProducts = async () => {
  const res = await fetch(`${API}/top-products`);
  return res.json();
};

export const uploadDataset = async (file) => {

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API}/upload`, {
    method: "POST",
    body: formData
  });

  return res.json();
};
