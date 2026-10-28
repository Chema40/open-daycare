export type Room = {
  id: string;
  name: string;
};

export type Child = {
  id: string;
  roomId: string;
  roomName: string;
  fullName: string;
  birthDate: string;
  enrolledAt: string;
  medicalNotes: string | null;
  allergyTags: string[];
  photoConsent: boolean;
  status: "active" | "archived";
};

export type ChildForm = {
  fullName: string;
  birthDate: string;
  enrolledAt: string;
  roomId: string;
  allergyTags: string;
  medicalNotes: string;
  photoConsent: boolean;
};
