"use client";

import { useEffect, useState } from "react";

function MyButton() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount((c) => c + 1);
  }

  return (
    <button onClick={handleClick}>Cliqué {count} fois</button>
  );
}

export default function Home() {
  useEffect(() => {
    document.title = "Transcendence";
  }, []);

  return (
    <div>
      <h1>Bienvenue dans mon appli</h1>
      <MyButton />
    </div>
  );
}