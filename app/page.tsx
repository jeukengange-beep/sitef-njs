"use client";

import { ChangeEvent, useMemo, useState } from "react";

type ReasonKey = "vente" | "contact" | "montrer" | "autre";

type ServiceItem = {
  title: string;
  description: string;
  price: string;
};

type VisualMood = "doux" | "joyeux" | "clair" | "chic" | "autre";

type VisualData = {
  hasLogo: "oui" | "non";
  logo?: string | null;
  photos: string[];
  colors: string[];
  mood: VisualMood;
  moodCustom: string;
};

type ContactData = {
  phone: string;
  other: string;
  city: string;
};

type BrandData = {
  feelings: [string, string, string];
  tone: "pose" | "direct" | "chaleureux" | "doux" | "rigolo";
  signature: string;
  dislikes: string;
  layout: "clair" | "range" | "vivant";
};

type FormData = {
  step1: {
    name: string;
    activity: string;
    reasons: ReasonKey[];
    otherReason: string;
  };
  services: ServiceItem[];
  visual: VisualData;
  contact: ContactData;
  brand: BrandData;
};

const reasonLabels: Record<ReasonKey, string> = {
  vente: "Pour vendre",
  contact: "Pour que les gens me contactent",
  montrer: "Pour montrer mon travail",
  autre: "Autre besoin"
};

const toneLabels: Record<BrandData["tone"], string> = {
  pose: "Posé et calme",
  direct: "Direct et franc",
  chaleureux: "Chaleureux et amical",
  doux: "Inspirant et doux",
  rigolo: "Rigolo et détendu"
};

const layoutLabels: Record<BrandData["layout"], string> = {
  clair: "Clair et vide, tout simple",
  range: "Un peu rempli mais bien rangé",
  vivant: "Plein d'images et de vie"
};

const moodLabels: Record<VisualMood, string> = {
  doux: "Doux et calme",
  joyeux: "Joyeux et coloré",
  clair: "Simple et clair",
  chic: "Chic et sérieux",
  autre: "Autre"
};

const MAX_SERVICES = 5;
const MAX_PHOTOS = 5;

const initialForm: FormData = {
  step1: {
    name: "",
    activity: "",
    reasons: [],
    otherReason: ""
  },
  services: [
    {
      title: "",
      description: "",
      price: ""
    }
  ],
  visual: {
    hasLogo: "non",
    logo: null,
    photos: [],
    colors: ["#7a5af8", "#f6f3ff", "#111827"],
    mood: "clair",
    moodCustom: ""
  },
  contact: {
    phone: "",
    other: "",
    city: ""
  },
  brand: {
    feelings: ["", "", ""],
    tone: "chaleureux",
    signature: "",
    dislikes: "",
    layout: "range"
  }
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const formatPhoneForWhatsApp = (value: string) => value.replace(/[^\d]/g, "");

const getMoodSubtitle = (mood: VisualMood, custom: string) => {
  if (mood === "autre") {
    return custom.trim() || "Un univers qui te ressemble";
  }
  return moodLabels[mood];
};

type PreviewProps = {
  data: FormData;
};

const SitePreview = ({ data }: PreviewProps) => {
  const {
    step1,
    services,
    visual,
    contact,
    brand
  } = data;

  const primaryColor = visual.colors[0] || "#7a5af8";
  const secondaryColor = visual.colors[1] || "#f6f3ff";
  const accentColor = visual.colors[2] || "#111827";

  const heroStyle = {
    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
  };

  const feelings = brand.feelings.filter((item) => item.trim() !== "");

  const reasonSummary = step1.reasons
    .map((reason) =>
      reason === "autre"
        ? step1.otherReason.trim() || reasonLabels.autre
        : reasonLabels[reason]
    )
    .join(" • ");

  const aboutLines = [
    step1.activity,
    reasonSummary,
    brand.signature
  ].filter((line) => line && line.trim() !== "");

  const sanitizedPhone = formatPhoneForWhatsApp(contact.phone);
  const phoneLink = sanitizedPhone ? `https://wa.me/${sanitizedPhone}` : "#";

  const moodSubtitle = getMoodSubtitle(visual.mood, visual.moodCustom);

  return (
    <div className="preview-card" style={{ borderColor: secondaryColor }}>
      <div className="preview-header" style={heroStyle}>
        <span className="badge">Aperçu de ton site</span>
        <h1 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>{step1.name || "Ton nom ici"}</h1>
        <p style={{ margin: 0, maxWidth: "36rem", fontSize: "1.05rem" }}>
          {moodSubtitle}
        </p>
        {visual.hasLogo === "oui" ? (
          visual.logo ? (
            <img
              src={visual.logo}
              alt="Ton logo"
              style={{
                marginTop: "0.75rem",
                maxWidth: "140px",
                borderRadius: "0.75rem",
                background: "rgba(255,255,255,0.3)",
                padding: "0.75rem"
              }}
            />
          ) : (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.85rem 1rem",
                borderRadius: "1rem",
                backgroundColor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(6px)",
                width: "fit-content"
              }}
            >
              <span style={{ fontWeight: 600 }}>Ton logo apparaitra ici</span>
            </div>
          )
        ) : null}
      </div>
      <div className="preview-body">
        <section className="preview-section">
          <h3 style={{ color: accentColor }}>À propos</h3>
          {aboutLines.length > 0 ? (
            aboutLines.map((line) => (
              <p key={line}>{line}</p>
            ))
          ) : (
            <p>Parle de ton activité pour que les visiteurs te comprennent vite.</p>
          )}
          {feelings.length > 0 ? (
            <div className="tag-cloud">
              {feelings.map((feeling, index) => (
                <span key={`${feeling}-${index}`}>{feeling}</span>
              ))}
            </div>
          ) : null}
        </section>

        {services.some((service) => service.title.trim()) ? (
          <section className="preview-section">
            <h3 style={{ color: accentColor }}>Ce que tu proposes</h3>
            <div className="preview-products">
              {services
                .filter((service) => service.title.trim())
                .map((service, index) => (
                  <div className="item" key={`${service.title}-${index}`} style={{ borderColor: secondaryColor }}>
                    <strong>{service.title}</strong>
                    <p>{service.description || "Ajoute une courte phrase pour donner envie."}</p>
                    {service.price ? (
                      <p style={{ fontWeight: 600, color: accentColor }}>{service.price}</p>
                    ) : null}
                  </div>
                ))}
            </div>
          </section>
        ) : null}

        {visual.photos.length > 0 ? (
          <section className="preview-section">
            <h3 style={{ color: accentColor }}>Ton univers</h3>
            <div className="preview-gallery">
              {visual.photos.map((photo, index) => (
                <img src={photo} alt={`Photo ${index + 1}`} key={`photo-${index}`} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="preview-section">
          <h3 style={{ color: accentColor }}>Contact</h3>
          {contact.city ? <p>Basé à {contact.city}</p> : null}
          <p>{contact.other || "Ajoute un moyen facile pour te joindre."}</p>
          {contact.phone ? <p style={{ fontWeight: 600 }}>Téléphone / WhatsApp : {contact.phone}</p> : null}
        </section>
      </div>
      <div className="preview-footer">
        <p style={{ margin: 0 }}>Ceci est un aperçu de ton futur site.</p>
        <p style={{ margin: 0 }}>Si tu aimes ce que tu vois, clique ici pour le faire exister dès 10 000 F.</p>
        <a
          href={phoneLink}
          className="cta"
          target="_blank"
          rel="noopener noreferrer"
          style={{ backgroundColor: "#22c55e" }}
        >
          Discuter sur WhatsApp
        </a>
      </div>
    </div>
  );
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [step, setStep] = useState(1);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  const currentServiceCount = formData.services.length;

  const canContinue = useMemo(() => {
    if (step === 1) {
      return (
        formData.step1.name.trim() !== "" &&
        formData.step1.activity.trim() !== "" &&
        formData.step1.reasons.length > 0
      );
    }

    if (step === 2) {
      return formData.services.every(
        (service, index) =>
          index !== 0 ||
          (service.title.trim() !== "" && service.description.trim() !== "")
      );
    }

    if (step === 3) {
      return formData.visual.colors.some((color) => color.trim() !== "");
    }

    if (step === 4) {
      return formData.contact.phone.trim() !== "";
    }

    if (step === 5) {
      return formData.brand.feelings.some((feeling) => feeling.trim() !== "");
    }

    return true;
  }, [formData, step]);

  const goNext = () => setStep((prev) => Math.min(prev + 1, 6));
  const goPrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const toggleReason = (reason: ReasonKey) => {
    setFormData((prev) => {
      const alreadySelected = prev.step1.reasons.includes(reason);
      return {
        ...prev,
        step1: {
          ...prev.step1,
          reasons: alreadySelected
            ? prev.step1.reasons.filter((item) => item !== reason)
            : [...prev.step1.reasons, reason]
        }
      };
    });
  };

  const updateService = (index: number, key: keyof ServiceItem, value: string) => {
    setFormData((prev) => {
      const nextServices = [...prev.services];
      nextServices[index] = {
        ...nextServices[index],
        [key]: value
      };
      return {
        ...prev,
        services: nextServices
      };
    });
  };

  const addService = () => {
    if (currentServiceCount >= MAX_SERVICES) return;
    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        { title: "", description: "", price: "" }
      ]
    }));
  };

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, idx) => idx !== index)
    }));
  };

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFormData((prev) => ({
        ...prev,
        visual: {
          ...prev.visual,
          logo: null
        }
      }));
      return;
    }

    const preview = await readFileAsDataUrl(file);
    setFormData((prev) => ({
      ...prev,
      visual: {
        ...prev.visual,
        logo: preview
      }
    }));
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, MAX_PHOTOS - formData.visual.photos.length);
    if (fileArray.length === 0) return;

    setIsLoadingPhotos(true);
    const previews = await Promise.all(fileArray.map((file) => readFileAsDataUrl(file)));
    setFormData((prev) => ({
      ...prev,
      visual: {
        ...prev.visual,
        photos: [...prev.visual.photos, ...previews].slice(0, MAX_PHOTOS)
      }
    }));
    setIsLoadingPhotos(false);
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      visual: {
        ...prev.visual,
        photos: prev.visual.photos.filter((_, idx) => idx !== index)
      }
    }));
  };

  const updateColor = (colorIndex: number, value: string) => {
    setFormData((prev) => {
      const colors = [...prev.visual.colors];
      colors[colorIndex] = value;
      return {
        ...prev,
        visual: {
          ...prev.visual,
          colors
        }
      };
    });
  };

  const updateFeeling = (index: number, value: string) => {
    setFormData((prev) => {
      const feelings = [...prev.brand.feelings] as [string, string, string];
      feelings[index] = value;
      return {
        ...prev,
        brand: {
          ...prev.brand,
          feelings
        }
      };
    });
  };

  return (
    <main>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
        <header style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p className="badge" style={{ justifyContent: "center" }}>
            Partage ton univers en quelques étapes simples
          </p>
          <h1 style={{ fontSize: "2.5rem", margin: "1rem 0 0.5rem" }}>Crée ton aperçu</h1>
          <p style={{ maxWidth: "40rem", margin: "0 auto", color: "#4b5563" }}>
            Raconte ce que tu fais, choisis tes couleurs et découvre une image claire de ton futur site.
          </p>
        </header>

        <div className="step-progress">
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className={index < step ? "active" : ""} />
          ))}
        </div>

        <div className="step-card">
          <div className="step-number">Étape {step}</div>

          {step === 1 ? (
            <section>
              <h2 className="section-title">Parle un peu de toi</h2>
              <p className="step-intro">
                Donne les infos de base. Cela aidera à poser le ton de ton aperçu.
              </p>
              <div className="multi-grid two">
                <div>
                  <label htmlFor="name">Ton nom ou celui de ton activité</label>
                  <input
                    id="name"
                    value={formData.step1.name}
                    placeholder="Maison Lysa, Papa Jo Coiffure..."
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        step1: { ...prev.step1, name: event.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="activity">Ce que tu fais en une phrase</label>
                  <input
                    id="activity"
                    value={formData.step1.activity}
                    placeholder="Je vends des jus naturels"
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        step1: { ...prev.step1, activity: event.target.value }
                      }))
                    }
                  />
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <p style={{ fontWeight: 500, marginBottom: "0.75rem" }}>Pourquoi tu veux ton site ?</p>
                <div className="choice-grid">
                  {Object.entries(reasonLabels).map(([key, label]) => (
                    <label
                      key={key}
                      className={formData.step1.reasons.includes(key as ReasonKey) ? "active" : ""}
                    >
                      <input
                        type="checkbox"
                        checked={formData.step1.reasons.includes(key as ReasonKey)}
                        onChange={() => toggleReason(key as ReasonKey)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                {formData.step1.reasons.includes("autre") ? (
                  <input
                    style={{ marginTop: "1rem" }}
                    placeholder="Précise ton autre raison ici"
                    value={formData.step1.otherReason}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        step1: { ...prev.step1, otherReason: event.target.value }
                      }))
                    }
                  />
                ) : null}
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section>
              <h2 className="section-title">Ce que tu proposes</h2>
              <p className="step-intro">
                Liste jusqu'à cinq offres. Une phrase simple et un prix si tu veux.
              </p>
              <div className="multi-grid" style={{ gap: "1.75rem" }}>
                {formData.services.map((service, index) => (
                  <div key={`service-${index}`} style={{ borderBottom: "1px solid #eef1fb", paddingBottom: "1.5rem" }}>
                    <div className="multi-grid two">
                      <div>
                        <label htmlFor={`service-title-${index}`}>Nom de l'offre {index + 1}</label>
                        <input
                          id={`service-title-${index}`}
                          value={service.title}
                          placeholder="Robe wax, jus d'ananas..."
                          onChange={(event) => updateService(index, "title", event.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor={`service-price-${index}`}>Prix (facultatif)</label>
                        <input
                          id={`service-price-${index}`}
                          value={service.price}
                          placeholder="10 000 F"
                          onChange={(event) => updateService(index, "price", event.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                      <label htmlFor={`service-description-${index}`}>Ta phrase qui donne envie</label>
                      <textarea
                        id={`service-description-${index}`}
                        rows={3}
                        value={service.description}
                        placeholder="Robe faite main pour briller les jours de fête."
                        onChange={(event) => updateService(index, "description", event.target.value)}
                      />
                    </div>
                    {currentServiceCount > 1 ? (
                      <button
                        type="button"
                        className="secondary"
                        style={{ marginTop: "1rem" }}
                        onClick={() => removeService(index)}
                      >
                        Retirer cette offre
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              {currentServiceCount < MAX_SERVICES ? (
                <button
                  type="button"
                  className="primary"
                  style={{ marginTop: "1rem", background: "#3b82f6", boxShadow: "0 10px 20px rgba(59,130,246,0.25)" }}
                  onClick={addService}
                >
                  Ajouter une autre offre
                </button>
              ) : null}
            </section>
          ) : null}

          {step === 3 ? (
            <section>
              <h2 className="section-title">Montre ton univers</h2>
              <p className="step-intro">
                Choisis tes couleurs, ajoute ton logo et quelques images si tu en as.
              </p>
              <div className="multi-grid two">
                <div>
                  <p style={{ fontWeight: 500, marginBottom: "0.5rem" }}>As-tu un logo ?</p>
                  <div className="choice-grid">
                    {["oui", "non"].map((value) => (
                      <label
                        key={value}
                        className={formData.visual.hasLogo === value ? "active" : ""}
                      >
                        <input
                          type="radio"
                          name="hasLogo"
                          checked={formData.visual.hasLogo === value}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              visual: {
                                ...prev.visual,
                                hasLogo: value as "oui" | "non"
                              }
                            }))
                          }
                        />
                        <span>{value === "oui" ? "Oui" : "Non"}</span>
                      </label>
                    ))}
                  </div>
                  {formData.visual.hasLogo === "oui" ? (
                    <div style={{ marginTop: "1rem" }}>
                      <input type="file" accept="image/*" onChange={handleLogoChange} />
                      {formData.visual.logo ? (
                        <img
                          src={formData.visual.logo}
                          alt="Aperçu du logo"
                          style={{ marginTop: "1rem", maxWidth: "180px", borderRadius: "0.75rem" }}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div>
                  <label>Choisis tes trois couleurs</label>
                  <div className="color-inputs">
                    {formData.visual.colors.map((color, index) => (
                      <div key={`color-${index}`}>
                        <input
                          type="color"
                          value={color}
                          onChange={(event) => updateColor(index, event.target.value)}
                          style={{ height: "3.5rem", padding: 0, cursor: "pointer" }}
                        />
                        <input
                          value={color}
                          onChange={(event) => updateColor(index, event.target.value)}
                          style={{ marginTop: "0.5rem" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "2rem" }}>
                <label htmlFor="mood">Comment tu veux que ton site se sente ?</label>
                <select
                  id="mood"
                  value={formData.visual.mood}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      visual: {
                        ...prev.visual,
                        mood: event.target.value as VisualMood
                      }
                    }))
                  }
                >
                  {Object.entries(moodLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                {formData.visual.mood === "autre" ? (
                  <input
                    style={{ marginTop: "1rem" }}
                    placeholder="Décris ce ressenti en un mot"
                    value={formData.visual.moodCustom}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        visual: { ...prev.visual, moodCustom: event.target.value }
                      }))
                    }
                  />
                ) : null}
              </div>

              <div style={{ marginTop: "2rem" }}>
                <label htmlFor="photos">Ajoute jusqu'à 5 photos de ton travail</label>
                <input id="photos" type="file" accept="image/*" multiple onChange={handlePhotoChange} />
                {isLoadingPhotos ? <p>Chargement des images...</p> : null}
                {formData.visual.photos.length > 0 ? (
                  <div className="preview-gallery" style={{ marginTop: "1rem" }}>
                    {formData.visual.photos.map((photo, index) => (
                      <div key={`selected-photo-${index}`} style={{ position: "relative" }}>
                        <img src={photo} alt={`Sélection ${index + 1}`} />
                        <button
                          type="button"
                          className="secondary"
                          style={{
                            position: "absolute",
                            top: "0.5rem",
                            right: "0.5rem",
                            padding: "0.4rem 0.6rem"
                          }}
                          onClick={() => removePhoto(index)}
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section>
              <h2 className="section-title">Pour te joindre</h2>
              <p className="step-intro">
                Laisse les infos pour que les personnes puissent te contacter facilement.
              </p>
              <div className="multi-grid two">
                <div>
                  <label htmlFor="phone">Ton numéro ou WhatsApp</label>
                  <input
                    id="phone"
                    value={formData.contact.phone}
                    placeholder="Ex. 070000000"
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, phone: event.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="other-contact">Un autre moyen (facultatif)</label>
                  <input
                    id="other-contact"
                    value={formData.contact.other}
                    placeholder="Email, Instagram, Facebook..."
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, other: event.target.value }
                      }))
                    }
                  />
                </div>
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <label htmlFor="city">Ta ville</label>
                <input
                  id="city"
                  value={formData.contact.city}
                  placeholder="Abidjan, Dakar, Cotonou..."
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, city: event.target.value }
                    }))
                  }
                />
              </div>
            </section>
          ) : null}

          {step === 5 ? (
            <section>
              <h2 className="section-title">Ce qui te ressemble</h2>
              <p className="step-intro">
                Choisis les mots et le ton qui décrivent ton univers.
              </p>
              <div>
                <p style={{ fontWeight: 500, marginBottom: "0.75rem" }}>
                  Quand quelqu'un visite ton site, tu veux qu'il ressente quoi ? (3 mots)
                </p>
                <div className="multi-grid two">
                  {formData.brand.feelings.map((feeling, index) => (
                    <div key={`feeling-${index}`}>
                      <label htmlFor={`feeling-${index}`}>Mot {index + 1}</label>
                      <input
                        id={`feeling-${index}`}
                        value={feeling}
                        placeholder="confiance, joie, fierté..."
                        onChange={(event) => updateFeeling(index, event.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <p style={{ fontWeight: 500, marginBottom: "0.75rem" }}>Comment tu parles habituellement ?</p>
                <div className="choice-grid">
                  {Object.entries(toneLabels).map(([key, label]) => (
                    <label key={key} className={formData.brand.tone === key ? "active" : ""}>
                      <input
                        type="radio"
                        name="tone"
                        checked={formData.brand.tone === key}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            brand: { ...prev.brand, tone: key as BrandData["tone"] }
                          }))
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <label htmlFor="signature">Un mot ou une expression qui te décrit bien</label>
                <input
                  id="signature"
                  value={formData.brand.signature}
                  placeholder="authentique, je ne lâche rien..."
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      brand: { ...prev.brand, signature: event.target.value }
                    }))
                  }
                />
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <label htmlFor="dislikes">Y a-t-il quelque chose que tu n'aimes pas du tout voir ?</label>
                <textarea
                  id="dislikes"
                  rows={3}
                  value={formData.brand.dislikes}
                  placeholder="Trop de couleurs, textes longs, photos d'inconnus..."
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      brand: { ...prev.brand, dislikes: event.target.value }
                    }))
                  }
                />
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <p style={{ fontWeight: 500, marginBottom: "0.75rem" }}>Quel style préfères-tu ?</p>
                <div className="choice-grid">
                  {Object.entries(layoutLabels).map(([key, label]) => (
                    <label key={key} className={formData.brand.layout === key ? "active" : ""}>
                      <input
                        type="radio"
                        name="layout"
                        checked={formData.brand.layout === key}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            brand: { ...prev.brand, layout: key as BrandData["layout"] }
                          }))
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {step === 6 ? (
            <section>
              <h2 className="section-title">Voici ton aperçu</h2>
              <p className="step-intro">
                Tout ce que tu viens de partager est rassemblé ici. Tu peux revenir en arrière pour ajuster si besoin.
              </p>
              <SitePreview data={formData} />
            </section>
          ) : null}

          <div className="step-actions">
            <button type="button" className="secondary" onClick={goPrev} disabled={step === 1}>
              Retour
            </button>
            <button
              type="button"
              className="primary"
              onClick={step === 6 ? () => window.scrollTo({ top: 0, behavior: "smooth" }) : goNext}
              disabled={!canContinue}
            >
              {step === 6 ? "Remonter en haut" : "Continuer"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
