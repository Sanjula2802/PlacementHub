async function checkVite() {
  const res = await fetch('http://localhost:5173/');
  console.log('Vite HTTP Status:', res.status);
  const text = await res.text();
  console.log('Contains root element:', text.includes('<div id="root"></div>'));
  
  // Test proxy through Vite
  const apiRes = await fetch('http://localhost:5173/api/health');
  console.log('Vite /api Proxy Status:', apiRes.status);
  const apiData = await apiRes.json();
  console.log('Proxy API Response:', apiData.status);
}

checkVite().catch(console.error);
