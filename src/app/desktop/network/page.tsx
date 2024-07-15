export default async function Page() {

  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return (
    <div>
      <h1>Network Page</h1>
      <p>This is a network-only page.</p>
    </div>
  );
}