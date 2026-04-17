export default function Dashboard() {

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div>

      <h1>Dashboard</h1>
      <p>You are logged in.</p>

      <button onClick={logout}>
        Logout
      </button>

    </div>
  );
}
