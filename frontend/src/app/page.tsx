import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/my-components/Navbar";

// Provide the public entry point and clear navigation to authentication.
export default function Home() {
  return (
    <main className="flex-col min-h-screen justify-center font-google-sans text-white">
      <Navbar/>
      <section className="max-w-2xl text-center">
        
      </section>
    </main>
  );
}
