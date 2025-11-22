import { Clock, PlayCircle } from "lucide-react";

interface VideoPreviewProps {
  title: string;
  thumbnail: string;
  duration: string;
  channel?: string;
}

export const VideoPreview = ({ title, thumbnail, duration, channel }: VideoPreviewProps) => {
  return (
    <div className="card-modern overflow-hidden group">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <PlayCircle className="w-16 h-16 text-white/90" />
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-medium">
          <Clock className="w-3.5 h-3.5" />
          {duration}
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-2 leading-snug text-gray-900">
          {title}
        </h3>
        {channel && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {channel.charAt(0).toUpperCase()}
            </span>
            {channel}
          </p>
        )}
      </div>
    </div>
  );
};
