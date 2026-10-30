export interface Channel {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;

  // role of *current user* in this channel
  role: "member" | "admin" | "owner";
}

export interface ChannelMember {
  userID: string;
  username: string;
  role: "member" | "admin" | "owner";
}
