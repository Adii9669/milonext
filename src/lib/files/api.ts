import { Message } from "@/src/features/Chat/types/messages";
import { apiFetch } from "../api/apiClient";

export interface UploadTarget {
  type: "dm" | "channel";
  receiverId?: string;
  channelId?: string;
}

export async function uploadChatFile(
  file: File,
  target: UploadTarget,
  caption = "",
): Promise<Message> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", target.type);
  if (target.receiverId) formData.append("receiverId", target.receiverId);
  if (target.channelId) formData.append("channelId", target.channelId);
  if (caption.trim()) formData.append("caption", caption.trim());

  const result = await apiFetch("/api/files/upload", {
    method: "POST",
    body: formData,
  });
  return result.message as Message;
}
