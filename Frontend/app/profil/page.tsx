
// // useEffect sert à dire "exécute ce code UNE seule fois".
// // Le tableau vide [] à la fin signifie "exécute ça seulement au premier chargement de la page".
// // Sans useEffect — fetch en boucle infinie

"use client";

import { useState, useEffect } from "react";
import profilImg from './profil.jpg';
import Image from 'next/image';


export default function Profil() {
    const [user, setUser] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
      const token = localStorage.getItem("token")
        const fetchUser = async () => {
            const res = await fetch("http://localhost:3001/user", {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.username);
                // console.log("data",data);
            } else {
                setMessage("Erreur : " + data.message);
            }
        };
        fetchUser();
        setMessage("yo yo yo yoyo je suis le rat qui rap\n ");
    }, []);

    return (
        <div>
            <h1><center>Bienvenue dans mon profil</center></h1>
            <p>Nom : {user}</p>
            <p>Message : {message}</p>
            <Image src={profilImg} alt="salut bg" width={200} height={200}/>
        </div>
    );
}