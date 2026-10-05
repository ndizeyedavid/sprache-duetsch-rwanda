import { useEffect, useState } from 'react';
// Refresh time-dependent join buttons and past/live presentation without refetching data.
export function useScheduleClock() {
  const [,tick]=useState(0);
  useEffect(()=>{const timer=setInterval(()=>tick(n=>n+1),30000);return ()=>clearInterval(timer);},[]);
}
