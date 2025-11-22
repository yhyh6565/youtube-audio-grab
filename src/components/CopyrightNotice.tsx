import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface CopyrightNoticeProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const CopyrightNotice = ({ checked, onCheckedChange }: CopyrightNoticeProps) => {
  return (
    <Card className="p-4 border-2 border-warning/20 bg-warning/5">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="space-y-3 flex-1">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">
              저작권 안내
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• 개인 소장 목적으로만 사용 가능합니다</li>
              <li>• 대량 배포 및 영리적 사용을 금지합니다</li>
              <li>• 저작권자의 권리를 존중해주세요</li>
            </ul>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="copyright"
              checked={checked}
              onCheckedChange={onCheckedChange}
            />
            <label
              htmlFor="copyright"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              위 내용을 확인했으며 동의합니다
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
};
