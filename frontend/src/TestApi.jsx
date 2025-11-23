import React, { useEffect, useState } from "react";

function TestApi() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/test/") // your backend API endpoint
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error fetching API:", err));
  }, []);

  return (
    <div>
      <h1>API Test Page</h1>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
}

export default TestApi;
