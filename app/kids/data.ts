export type LinkedParent = {
  name: string;
  relationship: string;
  status: "active" | "pending";
  initial: string;
  color: string;
};

export type Kid = {
  id: number;
  slug: string;
  name: string;
  initial: string;
  age: number;
  room: string;
  avatarColor: string;
  avatarTextColor: string;
  tags: string[];
  birthDate: string;
  admissionDate: string;
  notes?: string;
  linkedParents: LinkedParent[];
};

export const kids: Kid[] = [
  {
    id: 1,
    slug: "mateo-fernandez",
    name: "Mateo Fernández",
    initial: "M",
    age: 3,
    room: "Soles",
    avatarColor: "#A9D9E8",
    avatarTextColor: "#1F7A93",
    tags: ["MANÍ"],
    birthDate: "12 mar 2022",
    admissionDate: "feb 2025",
    notes: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
    linkedParents: [
      { name: "Lucía Fernández", relationship: "Mamá", status: "active", initial: "L", color: "#C9B6E8" },
      { name: "Diego Fernández", relationship: "Papá", status: "pending", initial: "D", color: "#A9C7E8" },
    ],
  },
  {
    id: 2,
    slug: "sofia-mendez",
    name: "Sofía Méndez",
    initial: "S",
    age: 2,
    room: "Soles",
    avatarColor: "#F4B8CC",
    avatarTextColor: "#C44A7A",
    tags: [],
    birthDate: "8 nov 2022",
    admissionDate: "mar 2025",
    linkedParents: [{ name: "Mariana Méndez", relationship: "Mamá", status: "active", initial: "M", color: "#C9B6E8" }],
  },
  {
    id: 3,
    slug: "benjamin-ruiz",
    name: "Benjamín Ruiz",
    initial: "B",
    age: 3,
    room: "Soles",
    avatarColor: "#B9DEC4",
    avatarTextColor: "#3E8B62",
    tags: [],
    birthDate: "21 jul 2022",
    admissionDate: "feb 2025",
    linkedParents: [
      { name: "Paula Ruiz", relationship: "Mamá", status: "active", initial: "P", color: "#F4B8CC" },
      { name: "Andrés Ruiz", relationship: "Papá", status: "active", initial: "A", color: "#A9C7E8" },
    ],
  },
  {
    id: 4,
    slug: "valentina-soto",
    name: "Valentina Soto",
    initial: "V",
    age: 2,
    room: "Soles",
    avatarColor: "#F4DC8E",
    avatarTextColor: "#9A7B1E",
    tags: ["VINCULAR"],
    birthDate: "4 oct 2022",
    admissionDate: "abr 2025",
    linkedParents: [],
  },
  {
    id: 5,
    slug: "tomas-diaz",
    name: "Tomás Díaz",
    initial: "T",
    age: 3,
    room: "Soles",
    avatarColor: "#C9B6E8",
    avatarTextColor: "#7B5FC0",
    tags: ["LACTOSA"],
    birthDate: "16 jun 2022",
    admissionDate: "feb 2025",
    notes: "Intolerancia a la lactosa. Ofrecer únicamente las alternativas indicadas.",
    linkedParents: [{ name: "Santiago Díaz", relationship: "Papá", status: "active", initial: "S", color: "#A9C7E8" }],
  },
  {
    id: 6,
    slug: "emma-castro",
    name: "Emma Castro",
    initial: "E",
    age: 2,
    room: "Soles",
    avatarColor: "#F4B8CC",
    avatarTextColor: "#C44A7A",
    tags: [],
    birthDate: "29 sep 2022",
    admissionDate: "mar 2025",
    linkedParents: [{ name: "Florencia Castro", relationship: "Mamá", status: "active", initial: "F", color: "#C9B6E8" }],
  },
  {
    id: 7,
    slug: "lucas-romero",
    name: "Lucas Romero",
    initial: "L",
    age: 3,
    room: "Soles",
    avatarColor: "#A9D9E8",
    avatarTextColor: "#1F7A93",
    tags: [],
    birthDate: "2 ago 2022",
    admissionDate: "feb 2025",
    linkedParents: [{ name: "Carla Romero", relationship: "Mamá", status: "active", initial: "C", color: "#F4B8CC" }],
  },
  {
    id: 8,
    slug: "olivia-vega",
    name: "Olivia Vega",
    initial: "O",
    age: 2,
    room: "Soles",
    avatarColor: "#B9DEC4",
    avatarTextColor: "#3E8B62",
    tags: [],
    birthDate: "11 dic 2022",
    admissionDate: "abr 2025",
    linkedParents: [{ name: "Nicolás Vega", relationship: "Papá", status: "active", initial: "N", color: "#A9C7E8" }],
  },
];

export function getKidByIdentifier(identifier: string): Kid | undefined {
  const numericId = Number(identifier);

  return kids.find((kid) => kid.id === numericId || kid.slug === identifier);
}
