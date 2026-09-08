import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { ProfileContent } from "@/types/profile";

// Tres plantillas simples (requisito opcional de punto extra): el
// estudiante elige `cvTemplate` en su panel y el PDF se genera con ese
// estilo, siempre a partir de la misma información publicada.

const baseStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#18181b" },
  name: { fontSize: 22, fontWeight: 700, marginBottom: 2 },
  career: { fontSize: 12, color: "#52525b", marginBottom: 10 },
  bio: { fontSize: 10, color: "#3f3f46", marginBottom: 16, lineHeight: 1.4 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  itemTitle: { fontSize: 10.5, fontWeight: 700 },
  itemSubtitle: { fontSize: 9.5, color: "#71717a", marginBottom: 2 },
  itemBody: { fontSize: 9.5, color: "#3f3f46", lineHeight: 1.35, marginBottom: 6 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    fontSize: 9,
    backgroundColor: "#f4f4f5",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 4,
  },
  contactLine: { fontSize: 9.5, color: "#3f3f46", marginBottom: 2 },
  divider: { height: 1, backgroundColor: "#e4e4e7", marginVertical: 10 },
  accentBar: { height: 4, backgroundColor: "#18181b", marginBottom: 16 },
});

function Header({ p }: { p: ProfileContent }) {
  return (
    <View>
      <Text style={baseStyles.name}>{p.fullName || "Sin nombre"}</Text>
      {p.career ? <Text style={baseStyles.career}>{p.career}</Text> : null}
      {p.bio ? <Text style={baseStyles.bio}>{p.bio}</Text> : null}
    </View>
  );
}

function ContactBlock({ p }: { p: ProfileContent }) {
  const c = p.contact;
  if (!c || (!c.email && !c.phone && !c.linkedin && !c.github)) return null;
  return (
    <View style={{ marginBottom: 10 }}>
      {c.email ? <Text style={baseStyles.contactLine}>{c.email}</Text> : null}
      {c.phone ? <Text style={baseStyles.contactLine}>{c.phone}</Text> : null}
      {c.linkedin ? (
        <Text style={baseStyles.contactLine}>{c.linkedin}</Text>
      ) : null}
      {c.github ? (
        <Text style={baseStyles.contactLine}>{c.github}</Text>
      ) : null}
    </View>
  );
}

function CvBody({ p }: { p: ProfileContent }) {
  return (
    <>
      {p.cv?.formacion?.length > 0 && (
        <View>
          <Text style={baseStyles.sectionTitle}>Formación</Text>
          {p.cv.formacion.map((f, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={baseStyles.itemTitle}>{f.titulo}</Text>
              <Text style={baseStyles.itemSubtitle}>
                {f.institucion}
                {f.periodo ? ` · ${f.periodo}` : ""}
              </Text>
            </View>
          ))}
        </View>
      )}

      {p.cv?.experiencia?.length > 0 && (
        <View>
          <Text style={baseStyles.sectionTitle}>Experiencia</Text>
          {p.cv.experiencia.map((e, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={baseStyles.itemTitle}>
                {e.puesto}
                {e.organizacion ? ` · ${e.organizacion}` : ""}
              </Text>
              <Text style={baseStyles.itemSubtitle}>{e.periodo}</Text>
              {e.descripcion ? (
                <Text style={baseStyles.itemBody}>{e.descripcion}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {p.projects?.length > 0 && (
        <View>
          <Text style={baseStyles.sectionTitle}>Proyectos</Text>
          {p.projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={baseStyles.itemTitle}>{proj.name}</Text>
              {proj.role ? (
                <Text style={baseStyles.itemSubtitle}>{proj.role}</Text>
              ) : null}
              {proj.description ? (
                <Text style={baseStyles.itemBody}>{proj.description}</Text>
              ) : null}
              {proj.tech ? (
                <Text style={baseStyles.itemSubtitle}>{proj.tech}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {p.cv?.reconocimientos?.length > 0 && (
        <View>
          <Text style={baseStyles.sectionTitle}>Reconocimientos</Text>
          {p.cv.reconocimientos.map((r, i) => (
            <Text key={i} style={baseStyles.itemBody}>
              {r.titulo}
              {r.detalle ? ` — ${r.detalle}` : ""}
            </Text>
          ))}
        </View>
      )}

      {p.skills?.length > 0 && (
        <View>
          <Text style={baseStyles.sectionTitle}>Habilidades</Text>
          {p.skills.map((group, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={baseStyles.itemSubtitle}>{group.category}</Text>
              <View style={baseStyles.row}>
                {group.items.map((item, j) => (
                  <Text key={j} style={baseStyles.chip}>
                    {item}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

// classic: encabezado simple + barra de acento
function ClassicCv({ p }: { p: ProfileContent }) {
  return (
    <Page size="A4" style={baseStyles.page}>
      <View style={baseStyles.accentBar} />
      <Header p={p} />
      <ContactBlock p={p} />
      <View style={baseStyles.divider} />
      <CvBody p={p} />
    </Page>
  );
}

// modern: dos columnas (contacto/habilidades a la izquierda)
function ModernCv({ p }: { p: ProfileContent }) {
  return (
    <Page size="A4" style={baseStyles.page}>
      <Header p={p} />
      <View style={baseStyles.divider} />
      <View style={{ flexDirection: "row", gap: 20 }}>
        <View style={{ width: "32%" }}>
          <Text style={baseStyles.sectionTitle}>Contacto</Text>
          <ContactBlock p={p} />
          {p.skills?.length > 0 && (
            <View>
              <Text style={baseStyles.sectionTitle}>Habilidades</Text>
              {p.skills.map((group, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={baseStyles.itemSubtitle}>{group.category}</Text>
                  <View style={baseStyles.row}>
                    {group.items.map((item, j) => (
                      <Text key={j} style={baseStyles.chip}>
                        {item}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={{ width: "68%" }}>
          {p.cv?.formacion?.length > 0 && (
            <View>
              <Text style={baseStyles.sectionTitle}>Formación</Text>
              {p.cv.formacion.map((f, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={baseStyles.itemTitle}>{f.titulo}</Text>
                  <Text style={baseStyles.itemSubtitle}>
                    {f.institucion}
                    {f.periodo ? ` · ${f.periodo}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {p.cv?.experiencia?.length > 0 && (
            <View>
              <Text style={baseStyles.sectionTitle}>Experiencia</Text>
              {p.cv.experiencia.map((e, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={baseStyles.itemTitle}>
                    {e.puesto}
                    {e.organizacion ? ` · ${e.organizacion}` : ""}
                  </Text>
                  <Text style={baseStyles.itemSubtitle}>{e.periodo}</Text>
                  {e.descripcion ? (
                    <Text style={baseStyles.itemBody}>{e.descripcion}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
          {p.projects?.length > 0 && (
            <View>
              <Text style={baseStyles.sectionTitle}>Proyectos</Text>
              {p.projects.map((proj, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={baseStyles.itemTitle}>{proj.name}</Text>
                  {proj.description ? (
                    <Text style={baseStyles.itemBody}>{proj.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Page>
  );
}

// minimal: todo en una columna, sin adornos
function MinimalCv({ p }: { p: ProfileContent }) {
  return (
    <Page size="A4" style={baseStyles.page}>
      <Text style={{ fontSize: 18, fontWeight: 700 }}>{p.fullName}</Text>
      {p.career ? (
        <Text style={{ fontSize: 10, color: "#71717a", marginBottom: 10 }}>
          {p.career}
        </Text>
      ) : null}
      <ContactBlock p={p} />
      <CvBody p={p} />
    </Page>
  );
}

export function CvDocument({ profile }: { profile: ProfileContent }) {
  const template = profile.cvTemplate || "classic";
  return (
    <Document>
      {template === "modern" ? (
        <ModernCv p={profile} />
      ) : template === "minimal" ? (
        <MinimalCv p={profile} />
      ) : (
        <ClassicCv p={profile} />
      )}
    </Document>
  );
}

// Registro de fuente por defecto para evitar advertencias en algunos entornos.
Font.registerHyphenationCallback((word) => [word]);
