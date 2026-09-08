"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CvTemplate, ProfileContent } from "@/types/profile";
import { isProfileComplete } from "@/types/profile";
import { saveDraftAction, publishAction, uploadPhotoAction } from "./actions";
import PublishSuccess from "./publish-success";

type Props = {
  slug: string;
  initialContent: ProfileContent;
  status: "borrador" | "publicado";
  publishedAt: string | null;
};

export default function ProfileEditor({
  slug,
  initialContent,
  status,
  publishedAt,
}: Props) {
  const [content, setContent] = useState<ProfileContent>(initialContent);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [showPublished, setShowPublished] = useState(false);
  const router = useRouter();

  function update<K extends keyof ProfileContent>(key: K, value: ProfileContent[K]) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  function handleSaveDraft() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        await saveDraftAction(slug, content);
        setMessage("Borrador guardado. Nadie en público lo ve todavía.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar.");
      }
    });
  }

  function handlePublish() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        await publishAction(slug, content);
        setCurrentStatus("publicado");
        setShowPublished(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al publicar.");
      }
    });
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const { url } = await uploadPhotoAction(slug, fd);
      update("photoUrl", url);
      setMessage("Foto cargada. No olvides guardar el borrador o publicar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la foto.");
    } finally {
      setUploading(false);
    }
  }

  const complete = isProfileComplete(content);

  return (
    <div className="space-y-7">
      {showPublished && (
        <PublishSuccess slug={slug} onClose={() => setShowPublished(false)} />
      )}

      {/* Barra de estado */}
      <div className="animate-fade-up flex flex-wrap items-center gap-3 rounded-2xl nm-raised-sm px-4 py-3">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            currentStatus === "publicado"
              ? "bg-nm-ok shadow-[0_0_0_4px_rgba(23,166,115,0.18)]"
              : "bg-[#e0a021] shadow-[0_0_0_4px_rgba(224,160,33,0.18)]"
          }`}
        />
        <span className="text-sm font-semibold text-nm-heading">
          {currentStatus === "publicado" ? "Publicado" : "Borrador"}
        </span>
        {publishedAt && currentStatus === "publicado" && (
          <span className="text-xs text-nm-soft">
            · última publicación{" "}
            {new Date(publishedAt).toLocaleString("es-MX")}
          </span>
        )}
      </div>

      {error && (
        <p className="animate-fade-up nm-inset rounded-xl px-3 py-2 text-sm text-nm-danger">
          {error}
        </p>
      )}
      {message && (
        <p className="animate-fade-up nm-inset rounded-xl px-3 py-2 text-sm text-nm-ok">
          {message}
        </p>
      )}

      {/* Encabezado */}
      <Card title="Encabezado">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 overflow-hidden rounded-full nm-inset p-1">
              {content.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={content.photoUrl}
                  alt="Foto de perfil"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full text-xs text-nm-soft">
                  Sin foto
                </div>
              )}
            </div>
            <label className="nm-press cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold text-nm-accent">
              {uploading ? "Subiendo…" : "Cambiar foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                disabled={uploading}
              />
            </label>
          </div>
          <div className="flex-1 space-y-3">
            <Field label="Nombre completo *">
              <input
                className="input"
                value={content.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </Field>
            <Field label="Carrera / profesión *">
              <input
                className="input"
                value={content.career}
                onChange={(e) => update("career", e.target.value)}
              />
            </Field>
            <Field label="Reseña breve">
              <textarea
                className="input min-h-20"
                value={content.bio}
                onChange={(e) => update("bio", e.target.value)}
              />
            </Field>
            <Field label="Plantilla del CV en PDF">
              <select
                className="input"
                value={content.cvTemplate}
                onChange={(e) =>
                  update("cvTemplate", e.target.value as CvTemplate)
                }
              >
                <option value="classic">Clásica</option>
                <option value="modern">Moderna (dos columnas)</option>
                <option value="minimal">Minimalista</option>
              </select>
            </Field>
          </div>
        </div>
      </Card>

      {/* Formación */}
      <Card title="Formación">
        <ListEditor
          items={content.cv.formacion}
          onChange={(items) =>
            update("cv", { ...content.cv, formacion: items })
          }
          emptyItem={{ titulo: "", institucion: "", periodo: "" }}
          renderItem={(item, onItemChange) => (
            <>
              <input
                className="input"
                placeholder="Título / grado"
                value={item.titulo}
                onChange={(e) => onItemChange({ ...item, titulo: e.target.value })}
              />
              <input
                className="input"
                placeholder="Institución"
                value={item.institucion}
                onChange={(e) =>
                  onItemChange({ ...item, institucion: e.target.value })
                }
              />
              <input
                className="input"
                placeholder="Periodo (ej. 2022 - presente)"
                value={item.periodo}
                onChange={(e) => onItemChange({ ...item, periodo: e.target.value })}
              />
            </>
          )}
          addLabel="+ Agregar formación"
        />
      </Card>

      {/* Experiencia */}
      <Card title="Experiencia">
        <ListEditor
          items={content.cv.experiencia}
          onChange={(items) =>
            update("cv", { ...content.cv, experiencia: items })
          }
          emptyItem={{ puesto: "", organizacion: "", periodo: "", descripcion: "" }}
          renderItem={(item, onItemChange) => (
            <>
              <input
                className="input"
                placeholder="Puesto"
                value={item.puesto}
                onChange={(e) => onItemChange({ ...item, puesto: e.target.value })}
              />
              <input
                className="input"
                placeholder="Organización"
                value={item.organizacion}
                onChange={(e) =>
                  onItemChange({ ...item, organizacion: e.target.value })
                }
              />
              <input
                className="input"
                placeholder="Periodo"
                value={item.periodo}
                onChange={(e) => onItemChange({ ...item, periodo: e.target.value })}
              />
              <textarea
                className="input min-h-16"
                placeholder="Descripción"
                value={item.descripcion}
                onChange={(e) =>
                  onItemChange({ ...item, descripcion: e.target.value })
                }
              />
            </>
          )}
          addLabel="+ Agregar experiencia"
        />
      </Card>

      {/* Reconocimientos */}
      <Card title="Reconocimientos">
        <ListEditor
          items={content.cv.reconocimientos}
          onChange={(items) =>
            update("cv", { ...content.cv, reconocimientos: items })
          }
          emptyItem={{ titulo: "", detalle: "" }}
          renderItem={(item, onItemChange) => (
            <>
              <input
                className="input"
                placeholder="Título"
                value={item.titulo}
                onChange={(e) => onItemChange({ ...item, titulo: e.target.value })}
              />
              <input
                className="input"
                placeholder="Detalle"
                value={item.detalle}
                onChange={(e) => onItemChange({ ...item, detalle: e.target.value })}
              />
            </>
          )}
          addLabel="+ Agregar reconocimiento"
        />
      </Card>

      {/* Proyectos */}
      <Card title="Proyectos">
        <ListEditor
          items={content.projects}
          onChange={(items) => update("projects", items)}
          emptyItem={{ name: "", description: "", tech: "", role: "", url: "" }}
          renderItem={(item, onItemChange) => (
            <>
              <input
                className="input"
                placeholder="Nombre del proyecto"
                value={item.name}
                onChange={(e) => onItemChange({ ...item, name: e.target.value })}
              />
              <input
                className="input"
                placeholder="Tu rol"
                value={item.role}
                onChange={(e) => onItemChange({ ...item, role: e.target.value })}
              />
              <textarea
                className="input min-h-16"
                placeholder="Descripción"
                value={item.description}
                onChange={(e) =>
                  onItemChange({ ...item, description: e.target.value })
                }
              />
              <input
                className="input"
                placeholder="Tecnologías"
                value={item.tech}
                onChange={(e) => onItemChange({ ...item, tech: e.target.value })}
              />
              <input
                className="input"
                placeholder="Enlace (https://...)"
                value={item.url}
                onChange={(e) => onItemChange({ ...item, url: e.target.value })}
              />
            </>
          )}
          addLabel="+ Agregar proyecto"
        />
        <p className="mt-2 text-xs text-nm-soft">
          Etiqueta como académicos los proyectos hechos en clase; que el
          contenido sea real ayuda a tu evaluación.
        </p>
      </Card>

      {/* Habilidades */}
      <Card title="Habilidades">
        <ListEditor
          items={content.skills}
          onChange={(items) => update("skills", items)}
          emptyItem={{ category: "", items: [] }}
          renderItem={(item, onItemChange) => (
            <>
              <input
                className="input"
                placeholder="Categoría (ej. Técnicas, Blandas)"
                value={item.category}
                onChange={(e) =>
                  onItemChange({ ...item, category: e.target.value })
                }
              />
              <input
                className="input"
                placeholder="Habilidades separadas por coma"
                value={item.items.join(", ")}
                onChange={(e) =>
                  onItemChange({
                    ...item,
                    items: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </>
          )}
          addLabel="+ Agregar categoría de habilidades"
        />
      </Card>

      {/* Contacto */}
      <Card title="Contacto">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Correo">
            <input
              className="input"
              value={content.contact.email}
              onChange={(e) =>
                update("contact", { ...content.contact, email: e.target.value })
              }
            />
          </Field>
          <Field label="Teléfono">
            <input
              className="input"
              value={content.contact.phone}
              onChange={(e) =>
                update("contact", { ...content.contact, phone: e.target.value })
              }
            />
          </Field>
          <Field label="LinkedIn">
            <input
              className="input"
              value={content.contact.linkedin}
              onChange={(e) =>
                update("contact", { ...content.contact, linkedin: e.target.value })
              }
            />
          </Field>
          <Field label="GitHub">
            <input
              className="input"
              value={content.contact.github}
              onChange={(e) =>
                update("contact", { ...content.contact, github: e.target.value })
              }
            />
          </Field>
        </div>
      </Card>

      {/* Acciones */}
      <div className="animate-fade-up sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl nm-raised px-4 py-3">
        <p className="text-xs text-nm-soft">
          {complete
            ? "Perfil completo: listo para publicar."
            : "Falta nombre y/o carrera para poder publicar."}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending}
            className="nm-raised-sm nm-press rounded-xl px-4 py-2 text-sm font-semibold text-nm-heading disabled:opacity-60"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${slug}`)}
            className="nm-raised-sm nm-press rounded-xl px-4 py-2 text-sm font-semibold text-nm-heading"
          >
            Previsualizar
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPending || !complete}
            className="nm-accent inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            {isPending && (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin-slow" />
            )}
            Publicar
          </button>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 0;
          border-radius: 0.6rem;
          padding: 0.55rem 0.8rem;
          font-size: 0.875rem;
          color: var(--nm-heading);
          background: var(--nm-bg);
          box-shadow:
            inset 3px 3px 7px var(--nm-shadow-dark),
            inset -3px -3px 7px var(--nm-shadow-light);
          transition: box-shadow 0.22s ease;
        }
        .input::placeholder {
          color: var(--nm-text-soft);
        }
        .input:focus {
          outline: none;
          box-shadow:
            inset 3px 3px 7px var(--nm-shadow-dark),
            inset -3px -3px 7px var(--nm-shadow-light),
            0 0 0 2px var(--nm-accent);
        }
      `}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-up rounded-2xl nm-raised p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-nm-heading">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-nm-soft">
        {label}
      </span>
      {children}
    </label>
  );
}

function ListEditor<T>({
  items,
  onChange,
  emptyItem,
  renderItem,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  emptyItem: T;
  renderItem: (item: T, onItemChange: (item: T) => void) => React.ReactNode;
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="animate-fade-up grid grid-cols-1 gap-2 rounded-xl nm-inset p-3 sm:grid-cols-2"
        >
          {renderItem(item, (updated) => {
            const next = [...items];
            next[i] = updated;
            onChange(next);
          })}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="col-span-full justify-self-start text-xs font-semibold text-nm-danger hover:underline"
          >
            Eliminar
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, emptyItem])}
        className="nm-raised-sm nm-press rounded-lg px-3 py-1.5 text-sm font-semibold text-nm-heading"
      >
        {addLabel}
      </button>
    </div>
  );
}
