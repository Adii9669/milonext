export interface Crew {
  id: string;
  name: string;

  ownerId: string;
  createdAt: string;

  // role of *current user* in this crew
  role: "member" | "admin" | "owner";
}
