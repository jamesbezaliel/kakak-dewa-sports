import { db } from "./src/firebase.js";
import { collection, addDoc } from "firebase/firestore";
import fs from "fs";

const data = JSON.parse(fs.readFileSync("./src/products.json", "utf-8"));

const seed = async () => {
  console.log("Seeding started...");

  for (const item of data) {
    await addDoc(collection(db, "products"), item);
    console.log("Added:", item.name);
  }

  console.log("Seeding done!");
};

seed();
