import { GoToApp } from "@/components/go-to-app-button";
import { App } from "@/lib/App";

export default function Hero() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative gap-6 flex-col flex place-items-center">
        <h1 className='font-mono font-black text-7xl tracking-wide'>{App.name}</h1>
        <h2 className="text-xl">{App.description}</h2>
        <GoToApp size='lg' className="rounded-[10px] px-20 text-lg font-medium bg-gradient-to-bl from-orange-800 hover:from-orange-600 hover:scale-110 duration-100 ease-in-out transition-all" /> 
      </div>
    </main>
  );
}
