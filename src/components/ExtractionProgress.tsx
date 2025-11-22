import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

interface Step {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed";
}

interface ExtractionProgressProps {
  steps: Step[];
  currentProgress: number;
}

export const ExtractionProgress = ({ steps, currentProgress }: ExtractionProgressProps) => {
  return (
    <div className="card-modern p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-3">
          <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
          <span className="text-sm font-medium text-purple-700">처리 중</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">음원 추출 중...</h3>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="relative">
          {/* Background */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            {/* Gradient Progress */}
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300 relative overflow-hidden"
              style={{ width: `${currentProgress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 shimmer" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">진행률</span>
          <span className="font-bold text-purple-600">{currentProgress}%</span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4 pt-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 pt-0.5">
              {step.status === "completed" ? (
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              ) : step.status === "processing" ? (
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                </div>
              ) : (
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Circle className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <p
                className={`text-sm font-medium ${
                  step.status === "completed"
                    ? "text-green-700"
                    : step.status === "processing"
                    ? "text-purple-700"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </p>
              {step.status === "processing" && (
                <p className="text-xs text-gray-500 mt-0.5">진행 중...</p>
              )}
              {step.status === "completed" && (
                <p className="text-xs text-green-600 mt-0.5">완료</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-4">
        <p className="text-sm text-purple-800">
          <span className="font-semibold">💡 Tip:</span> 처리 시간은 영상 길이에 따라 달라질 수 있습니다
        </p>
      </div>
    </div>
  );
};
