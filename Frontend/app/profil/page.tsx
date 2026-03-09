export default function Home() {
  return (
    <div>
      <h1>Bienvenue dans mon profil</h1>
    </div>
  );
}



// "use client";

// import { useState } from "react";
// export default async function Home() {
//   const [name, setName] = useState("");
//   const [message, setMessage] = useState("");

//     try {
//       const res = await fetch("http://localhost:3001/user", {
//         method: "GET",
//         headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setName(data.name);
//         console.log("✓ Profil : " + data);
//       }
//     //   } else {
//     //     setMessage("✗ " + data.message);
//     //   }
//     } catch (error) {
//       console.log("✗ Serveur inaccessible");
//     }
//     return (
//       <div>
//         <h1>Bienvenue dans mon profil</h1>
//         <p>Nom : {name}</p>
//         <p>Message : {message}</p> 
//       </div>
//     );
//   };

