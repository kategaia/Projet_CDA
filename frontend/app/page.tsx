export default async function Home() {
  const res = await fetch("http://localhost:5000/api/hello");
  const data = await res.json();
  return <h1>{data.message}</h1>

  
}