import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Share2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DownloadCompleteProps {
  filename: string;
  onReset: () => void;
}

export const DownloadComplete = ({ filename, onReset }: DownloadCompleteProps) => {
  const { toast } = useToast();

  const getDeviceMessage = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return "파일 앱에서 확인하세요";
    } else if (/android/.test(userAgent)) {
      return "다운로드 폴더에서 확인하세요";
    }
    return "다운로드 폴더에서 확인하세요";
  };

  const handleShare = async () => {
    const shareData = {
      title: "유튜브 음원 추출",
      text: "유튜브 커버곡을 쉽게 음원으로! 🎵",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "링크가 복사되었습니다",
        description: "다른 사람에게 공유해보세요!",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4 border-2 border-success/20 bg-success/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">
              다운로드 완료!
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {getDeviceMessage()}
            </p>
          </div>
        </div>

        <div className="pt-2 pb-1">
          <p className="text-sm text-muted-foreground">저장된 파일명</p>
          <p className="font-medium text-foreground mt-1 break-all">
            {filename}.mp3
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleShare}
          className="h-12 gap-2 border-2"
        >
          <Share2 className="w-4 h-4" />
          공유하기
        </Button>
        <Button
          onClick={onReset}
          className="h-12 gap-2 bg-primary hover:bg-primary-hover"
        >
          <RotateCcw className="w-4 h-4" />
          새로 추출
        </Button>
      </div>
    </div>
  );
};
