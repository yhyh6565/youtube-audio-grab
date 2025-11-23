import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { URLInput } from "@/components/URLInput";
import { VideoPreview } from "@/components/VideoPreview";
import { CopyrightNotice } from "@/components/CopyrightNotice";
import { ExtractionProgress } from "@/components/ExtractionProgress";
import { FilenameEditor } from "@/components/FilenameEditor";
import { DownloadComplete } from "@/components/DownloadComplete";
import { Button } from "@/components/ui/button";
import { Download, Music, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { previewVideo, extractAudio, downloadFile, formatDuration, VideoInfo, PreviewData } from "@/lib/api";
import { getExtractionSteps, type AppStep } from "@/lib/constants";

export default function Index() {
  const [currentStep, setCurrentStep] = useState<AppStep>("input");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState(""); // Store the original YouTube URL
  const [copyrightAgreed, setCopyrightAgreed] = useState(false);
  const [filename, setFilename] = useState("");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const { toast } = useToast();

  const extractionSteps = getExtractionSteps(progress);

  const handleUrlSubmit = async (url: string) => {
    setIsProcessing(true);

    try {
      const info = await previewVideo(url);
      setVideoInfo(info);
      setYoutubeUrl(url); // Save the original URL
      setCopyrightAgreed(false);
      setCurrentStep("preview");

      if (info.warning === 'long_video') {
        toast({
          title: "긴 영상입니다",
          description: "처리 시간이 오래 걸릴 수 있습니다",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: error instanceof Error ? error.message : "영상을 불러올 수 없습니다",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtract = () => {
    if (!copyrightAgreed) {
      toast({
        variant: "destructive",
        title: "저작권 동의 필요",
        description: "저작권 안내를 확인하고 동의해주세요.",
      });
      return;
    }

    if (!videoInfo) return;

    setCurrentStep("extracting");
    setProgress(0);

    // Extract audio via SSE
    const cleanup = extractAudio(
      youtubeUrl, // Use the actual YouTube URL
      (event) => {
        setProgress(event.progress);
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "추출 실패",
          description: error.message,
        });
        setCurrentStep("preview");
        setProgress(0);
      },
      (preview, sid) => {
        setPreviewData(preview);
        setSessionId(sid);
        setFilename(preview.suggested_filename);
        setCurrentStep("ready");
      }
    );

    // Cleanup on unmount
    return cleanup;
  };

  const handleDownload = async () => {
    if (!sessionId) return;

    try {
      await downloadFile(sessionId, filename);

      toast({
        title: "다운로드 완료",
        description: "파일이 다운로드되었습니다",
      });

      setCurrentStep("complete");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "다운로드 실패",
        description: error instanceof Error ? error.message : "다운로드 중 오류가 발생했습니다",
      });
    }
  };

  const handleReset = () => {
    setCurrentStep("input");
    setVideoInfo(null);
    setYoutubeUrl("");
    setPreviewData(null);
    setFilename("");
    setCopyrightAgreed(false);
    setProgress(0);
    setSessionId("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-soft" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
          {currentStep === "input" && (
            <div className="space-y-6 animate-fade-in">
              {/* Hero Section */}
              <div className="text-center space-y-4 py-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">100% 무료, 광고 없음</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-gradient">유튜브 커버곡</span>을<br />
                  <span className="text-gray-900">쉽게 음원으로</span>
                </h1>

                <p className="text-lg text-gray-600 max-w-lg mx-auto">
                  URL만 입력하면 자동으로 음원 추출과<br />
                  커버 이미지 삽입까지 한 번에!
                </p>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Music className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-600">고음질 MP3</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-6 h-6 text-pink-600" />
                    </div>
                    <p className="text-xs text-gray-600">자동 커버 이미지</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Download className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-xs text-gray-600">원클릭 다운로드</p>
                  </div>
                </div>
              </div>

              {/* URL Input Card */}
              <div className="card-modern p-6 space-y-4">
                <URLInput onSubmit={handleUrlSubmit} isLoading={isProcessing} />

                <div className="pt-2 text-center">
                  <p className="text-sm text-gray-500">
                    유튜브 영상 URL을 입력하면 자동으로 음원을 추출합니다
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === "preview" && videoInfo && (
            <div className="space-y-6 animate-slide-up">
              <VideoPreview
                title={videoInfo.title}
                thumbnail={videoInfo.thumbnail_url}
                duration={formatDuration(videoInfo.duration)}
                channel={videoInfo.channel}
              />

              <CopyrightNotice
                checked={copyrightAgreed}
                onCheckedChange={setCopyrightAgreed}
              />

              <Button
                onClick={handleExtract}
                disabled={!copyrightAgreed}
                className="w-full h-14 text-lg btn-primary"
              >
                <Music className="w-5 h-5 mr-2" />
                음원 추출하기
              </Button>
            </div>
          )}

          {currentStep === "extracting" && videoInfo && (
            <div className="space-y-6 animate-slide-up">
              <VideoPreview
                title={videoInfo.title}
                thumbnail={videoInfo.thumbnail_url}
                duration={formatDuration(videoInfo.duration)}
                channel={videoInfo.channel}
              />

              <ExtractionProgress
                steps={extractionSteps as any}
                currentProgress={progress}
              />
            </div>
          )}

          {currentStep === "ready" && previewData && (
            <div className="space-y-6 animate-slide-up">
              <VideoPreview
                title={previewData.original_title}
                thumbnail={previewData.thumbnail_url}
                duration={formatDuration(previewData.duration)}
                channel=""
              />

              <FilenameEditor
                defaultFilename={filename}
                onChange={setFilename}
              />

              <Button
                onClick={handleDownload}
                className="w-full h-14 text-lg btn-primary"
              >
                <Download className="w-5 h-5 mr-2" />
                다운로드
              </Button>
            </div>
          )}

          {currentStep === "complete" && (
            <div className="animate-slide-up">
              <DownloadComplete filename={filename} onReset={handleReset} />
            </div>
          )}
        </main>

        <footer className="w-full py-8 px-4 mt-12 border-t border-white/50 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <p className="text-sm text-gray-600">
              개인 소장 목적으로만 사용해주세요
            </p>
            <p className="text-xs text-gray-500">
              © 2024 YouTube Audio Extractor
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
