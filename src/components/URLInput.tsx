import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface URLInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export const URLInput = ({ onSubmit, isLoading }: URLInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateYouTubeUrl = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/youtu\.be\/[\w-]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("유튜브 URL을 입력해주세요");
      return;
    }

    if (!validateYouTubeUrl(url)) {
      setError("올바른 유튜브 URL을 입력해주세요");
      return;
    }

    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
        <div className="relative">
          <Input
            type="text"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            className={`input-modern ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
            disabled={isLoading}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          <span className="text-red-500">⚠</span>
          <p>{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 text-lg btn-primary"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            확인 중...
          </>
        ) : (
          <>
            <Search className="mr-2 h-5 w-5" />
            영상 확인하기
          </>
        )}
      </Button>
    </form>
  );
};
