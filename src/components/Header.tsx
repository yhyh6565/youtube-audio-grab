import { Music2 } from "lucide-react";

export const Header = () => {
  return (
    <header className="w-full py-6 px-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[hsl(330,81%,60%)] flex items-center justify-center shadow-lg">
          <Music2 className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-[hsl(330,81%,60%)] bg-clip-text text-transparent">
          유튜브 음원 추출
        </h1>
      </div>
    </header>
  );
};
