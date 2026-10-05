'use client';

import { useState, useMemo } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useConnectionState,
} from '@livekit/components-react';
import { DisconnectReason, ConnectionState, VideoPresets, RoomOptions } from 'livekit-client';
import '@livekit/components-styles';
import {
  RefreshCw,
  LogOut,
  Loader2,
  WifiOff,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { thongBao } from '../../../../../tien-ich/thong-bao';

interface ThuocTinhThanhPhanPhongHoc {
  urlMayChuLiveKit: string;
  token: string;
  onLeaveRoom: () => void;
  onReloadToken?: () => void;
}

function ThanhBaoTrangThaiMang() {
  const connectionState = useConnectionState();

  if (
    connectionState === ConnectionState.Reconnecting ||
    connectionState === ConnectionState.SignalReconnecting
  ) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-500/90 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm animate-pulse border border-amber-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Đang khôi phục đường truyền phòng học...
      </div>
    );
  }

  return null;
}

export default function ThanhPhanPhongHocLiveKit({
  urlMayChuLiveKit,
  token,
  onLeaveRoom,
  onReloadToken,
}: ThuocTinhThanhPhanPhongHoc) {
  const [lyDoMatKetNoi, setLyDoMatKetNoi] = useState<string | null>(null);
  const [daRoiPhong, setDaRoiPhong] = useState(false);
  const [soLanThuLai, setSoLanThuLai] = useState(0);
  const [cheDoGocRong, setCheDoGocRong] = useState(true); // true = contain (chuẩn góc rộng 16:9, không zoom gần)

  // Cấu hình phòng học chuẩn HD và tối ưu băng thông
  const tuyChonPhong = useMemo<RoomOptions>(
    () => ({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
        facingMode: 'user',
      },
      publishDefaults: {
        simulcast: true,
        videoCodec: 'vp8',
        videoSimulcastLayers: [VideoPresets.h720, VideoPresets.h360],
      },
    }),
    [],
  );

  const xuLyMatKetNoi = (lyDo?: DisconnectReason) => {
    // 1. Nếu do người dùng bấm nút Rời phòng (Leave) trong thanh điều khiển LiveKit
    if (lyDo === DisconnectReason.CLIENT_INITIATED) {
      setDaRoiPhong(true);
      return;
    }

    // 2. Do sự cố mạng hoặc máy chủ ngắt kết nối
    let thongDiep = 'Đường truyền tới phòng học bị ngắt kết nối.';
    if (lyDo === DisconnectReason.CONNECTION_TIMEOUT) {
      thongDiep = 'Hết thời gian chờ kết nối WebRTC (ICE Connection Timeout). Máy chủ không phản hồi gói tin.';
    } else if (lyDo === DisconnectReason.DUPLICATE_IDENTITY) {
      thongDiep = 'Tài khoản của bạn đã tham gia phòng học từ một thiết bị hoặc tab trình duyệt khác.';
    } else if (
      lyDo === DisconnectReason.SERVER_SHUTDOWN ||
      lyDo === DisconnectReason.ROOM_CLOSED
    ) {
      thongDiep = 'Buổi học trực tuyến đã kết thúc bởi giảng viên hoặc máy chủ.';
    } else if (lyDo === DisconnectReason.PARTICIPANT_REMOVED) {
      thongDiep = 'Bạn đã được người chủ trì đưa ra khỏi phòng học.';
    } else if (lyDo === DisconnectReason.JOIN_FAILURE) {
      thongDiep = 'Không thể xác thực thông tin thành viên tham gia phòng học.';
    }

    setLyDoMatKetNoi(thongDiep);
    thongBao.canhBao(thongDiep);
  };

  const xuLyLoiPhong = (loi: Error) => {
    console.error('Lỗi kết nối phòng học LiveKit:', loi);
  };

  const xuLyThuLai = () => {
    setLyDoMatKetNoi(null);
    setDaRoiPhong(false);
    setSoLanThuLai((truoc) => truoc + 1);
    if (onReloadToken) {
      onReloadToken();
    }
  };

  // Màn hình khi người dùng đã chủ động rời phòng
  if (daRoiPhong) {
    return (
      <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
          <LogOut className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Bạn đã rời khỏi phòng học</h3>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Bạn vừa kết thúc phiên học trực tuyến. Bạn có thể tham gia lại phòng bất cứ lúc nào hoặc quay về trang thông tin lớp học.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={xuLyThuLai}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Tham gia lại
          </button>
          <button
            onClick={onLeaveRoom}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border border-slate-700 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Quay lại lớp học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col bg-slate-950">
      {/* TÙY CHỈNH CSS CAMERA GÓC RỘNG VÀ ĐỘ PHÂN GIẢI CHUẨN */}
      <style>{`
        .lk-video-conference {
          background-color: #020617 !important;
        }
        .lk-participant-tile video,
        .lk-video-container video,
        .lk-focus-layout video {
          object-fit: ${cheDoGocRong ? 'contain' : 'cover'} !important;
          background-color: #090d16 !important;
        }
        .lk-participant-tile {
          border-radius: 0.75rem !important;
          border: 1px solid rgba(51, 65, 85, 0.4) !important;
        }
        .lk-control-bar {
          border-radius: 1rem !important;
          background-color: rgba(15, 23, 42, 0.9) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(51, 65, 85, 0.5) !important;
        }
      `}</style>

      {/* NÚT CHUYỂN ĐỔI CHẾ ĐỘ CAMERA GÓC RỘNG / LẤP ĐẦY */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs shadow-lg">
        <span className="text-slate-400 hidden sm:inline">Khung hình:</span>
        <button
          onClick={() => setCheDoGocRong(!cheDoGocRong)}
          className="inline-flex items-center gap-1.5 font-medium text-blue-400 hover:text-blue-300 transition-colors"
          title={cheDoGocRong ? 'Đang ở chế độ Góc rộng chuẩn 16:9' : 'Đang ở chế độ Phóng to lấp đầy'}
        >
          {cheDoGocRong ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Góc rộng chuẩn 16:9</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Phóng to lấp đầy</span>
            </>
          )}
        </button>
      </div>

      {lyDoMatKetNoi ? (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 animate-bounce">
            <WifiOff className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Đường truyền bị ngắt kết nối</h3>
          <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            {lyDoMatKetNoi}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={xuLyThuLai}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Thử kết nối lại
            </button>
            <button
              onClick={onLeaveRoom}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border border-slate-700 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Rời phòng học
            </button>
          </div>
        </div>
      ) : (
        <LiveKitRoom
          key={`livekit-phong-${soLanThuLai}`}
          serverUrl={urlMayChuLiveKit}
          token={token}
          connect={true}
          video={{
            resolution: VideoPresets.h720.resolution,
            facingMode: 'user',
          }}
          audio={{
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true,
          }}
          options={tuyChonPhong}
          data-lk-theme="default"
          onDisconnected={xuLyMatKetNoi}
          onError={xuLyLoiPhong}
          className="h-full w-full flex flex-col"
        >
          <ThanhBaoTrangThaiMang />
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      )}
    </div>
  );
}
