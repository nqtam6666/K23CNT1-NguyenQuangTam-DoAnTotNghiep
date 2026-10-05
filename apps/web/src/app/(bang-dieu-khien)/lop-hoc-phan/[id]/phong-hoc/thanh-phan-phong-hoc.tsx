'use client';

import { useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useConnectionState,
} from '@livekit/components-react';
import { DisconnectReason, ConnectionState } from 'livekit-client';
import '@livekit/components-styles';
import { RefreshCw, LogOut, Loader2, WifiOff } from 'lucide-react';
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
  const [soLanThuLai, setSoLanThuLai] = useState(0);

  const xuLyMatKetNoi = (lyDo?: DisconnectReason) => {
    // 1. Nếu do người dùng chủ động bấm Rời phòng (Leave)
    if (lyDo === DisconnectReason.CLIENT_INITIATED) {
      onLeaveRoom();
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
    setSoLanThuLai((truoc) => truoc + 1);
    if (onReloadToken) {
      onReloadToken();
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col bg-slate-950">
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
          key={`${token}-${soLanThuLai}`}
          serverUrl={urlMayChuLiveKit}
          token={token}
          connect={true}
          video={true}
          audio={true}
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
