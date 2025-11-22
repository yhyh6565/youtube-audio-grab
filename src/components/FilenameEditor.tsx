import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface FilenameEditorProps {
  defaultFilename: string;
  onChange: (filename: string) => void;
}

export const FilenameEditor = ({ defaultFilename, onChange }: FilenameEditorProps) => {
  const [filename, setFilename] = useState(defaultFilename);

  useEffect(() => {
    setFilename(defaultFilename);
  }, [defaultFilename]);

  const sanitizeFilename = (name: string) => {
    return name
      .replace(/[/\\:*?"<>|]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200);
  };

  const handleChange = (value: string) => {
    const sanitized = sanitizeFilename(value);
    setFilename(sanitized);
    onChange(sanitized);
  };

  return (
    <Card className="p-4 space-y-3 border-2">
      <Label htmlFor="filename" className="text-sm font-medium">
        파일명 수정
      </Label>
      <div className="space-y-2">
        <Input
          id="filename"
          type="text"
          value={filename}
          onChange={(e) => handleChange(e.target.value)}
          className="h-12 text-base"
        />
        <p className="text-xs text-muted-foreground">
          최종 파일명: <span className="font-medium text-foreground">{filename}.mp3</span>
        </p>
      </div>
    </Card>
  );
};
