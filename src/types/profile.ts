// Forma del documento JSON guardado en profiles.draft / profiles.published.
// Ver supabase/schema.sql para la documentación completa.

export type CvTemplate = "classic" | "modern" | "minimal";

export interface FormacionItem {
  titulo: string;
  institucion: string;
  periodo: string;
}

export interface ExperienciaItem {
  puesto: string;
  organizacion: string;
  periodo: string;
  descripcion: string;
}

export interface ReconocimientoItem {
  titulo: string;
  detalle: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  tech: string;
  role: string;
  url: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
}

export interface ProfileContent {
  fullName: string;
  career: string;
  bio: string;
  photoUrl: string | null;
  cvTemplate: CvTemplate;
  cv: {
    formacion: FormacionItem[];
    experiencia: ExperienciaItem[];
    reconocimientos: ReconocimientoItem[];
  };
  skills: SkillGroup[];
  projects: ProjectItem[];
  contact: ContactInfo;
}

export const emptyProfileContent = (): ProfileContent => ({
  fullName: "",
  career: "",
  bio: "",
  photoUrl: null,
  cvTemplate: "classic",
  cv: { formacion: [], experiencia: [], reconocimientos: [] },
  skills: [],
  projects: [],
  contact: { email: "", phone: "", linkedin: "", github: "" },
});

// Requisito #5: "Datos de ejemplo propios: cada estudiante carga su perfil
// real para demostrar su proyecto" — no incluimos datos falsos por defecto,
// solo la estructura vacía para que el estudiante la llene con su propia
// información real.

export function isProfileComplete(content: ProfileContent): boolean {
  return Boolean(content.fullName?.trim() && content.career?.trim());
}

export interface StudentRow {
  id: string;
  slug: string;
  active: boolean;
  created_at: string;
}

export interface ProfileRow {
  student_id: string;
  status: "borrador" | "publicado";
  draft: ProfileContent;
  published: ProfileContent | null;
  published_at: string | null;
  updated_at: string;
}

export interface StudentWithProfile extends StudentRow {
  profile: ProfileRow;
  email?: string;
}
