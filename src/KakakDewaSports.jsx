import { useState, useEffect, useRef, useCallback } from "react";
import KakakDewaLogo from "./assets/kakakdewa-logo.png";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

const WA = "6282124377830";
const TOKO = "Kakak Dewa Sports";

const TYPES = [
  { key: "all", label: "Semua" },
  { key: "pcp", label: "PCP" },
  { key: "uklik", label: "Uklik" },
  { key: "bocap", label: "Bocap" },
  { key: "gejluk", label: "Gejluk" },
];
const SORTS = [
  { key: "", label: "Default" },
  { key: "pa", label: "Harga: Terendah" },
  { key: "pd", label: "Harga: Tertinggi" },
  { key: "na", label: "Nama: A–Z" },
  { key: "nd", label: "Nama: Z–A" },
];

const fmt = (p) => "Rp " + p.toLocaleString("id-ID");
const waLink = (p) => {
  const msg = encodeURIComponent(
    `Halo ${TOKO}, saya tertarik dengan:\n\n` +
      `- *${p.brand} ${p.name}*\n` +
      `- Jenis: ${p.type.toUpperCase()}\n` +
      `- Harga: ${fmt(p.price)}\n` +
      `- Kaliber: ${p.caliber}\n\n` +
      `Apakah stok tersedia? Terima kasih!`,
  );
  return `https://wa.me/${WA}?text=${msg}`;
};

// ── ICONS ──
const WaIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.178 3.178 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
const IgIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const FbIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const PinIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const ClockIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const PhoneIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.89 3.5 2 2 0 0 1 3.87 1.36h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l.76-.76a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const SearchIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const Logo = ({ size = 44 }) => {
  const [err, setErr] = useState(false);
  return err ? (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        background:
          "linear-gradient(160deg,#CC1F1F 0%,#8a0f0f 60%,#2a0404 100%)",
        borderRadius: "16% 16% 50% 50%/12% 12% 40% 40%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 12px rgba(204,31,31,.5)",
        border: "1.5px solid rgba(255,255,255,0.12)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 40% 28%, rgba(255,255,255,.18) 0%, transparent 55%)",
        }}
      />
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        style={{ position: "relative", zIndex: 1 }}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="white"
          strokeWidth="1.4"
          opacity="0.9"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          stroke="white"
          strokeWidth="1.4"
          opacity="0.9"
        />
        <circle cx="12" cy="12" r="1.5" fill="white" />
        <line
          x1="12"
          y1="2"
          x2="12"
          y2="6.5"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="12"
          y1="17.5"
          x2="12"
          y2="22"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="2"
          y1="12"
          x2="6.5"
          y2="12"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="17.5"
          y1="12"
          x2="22"
          y2="12"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  ) : (
    <img
      src={KakakDewaLogo}
      alt="Kakak Dewa Sports"
      onError={() => setErr(true)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        flexShrink: 0,
        filter: "drop-shadow(0 0 8px rgba(204,31,31,.45))",
      }}
    />
  );
};

// ── BADGE ──
const Badge = ({ badge }) => {
  if (!badge) return null;
  const map = {
    hot: ["🔥 Terlaris", "#e55a00"],
    new: ["✨ Baru", "#CC1F1F"],
    ready: ["✅ Ready", "#2ecc71"],
  };
  const [label, color] = map[badge] || ["", "#999"];
  return (
    <span
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 2,
        fontFamily: "'DM Mono',monospace",
        fontSize: ".58rem",
        letterSpacing: "1px",
        padding: ".18rem .5rem",
        borderRadius: 4,
        textTransform: "uppercase",
        background: color,
        color: badge === "ready" ? "#000" : "#fff",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
};

// ── HEADER ──
const Header = ({ onNavClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mob, setMob] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  const nav = (l) => {
    setMenuOpen(false);
    onNavClick(l);
  };
  const SOCIALS = [
    {
      href: "https://www.instagram.com/kakakdewa.sport/",
      icon: <IgIcon />,
      title: "Instagram",
    },
    {
      href: "https://www.facebook.com/profile.php?id=61588663539438",
      icon: <FbIcon />,
      title: "Facebook",
    },
  ];
  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 500,
          background: "rgba(8,8,8,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #252525",
          height: 66,
          padding: "0 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".6rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Logo size={mob ? 38 : 44} />
          <div style={{ lineHeight: 1.1 }}>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: mob ? "1rem" : "1.25rem",
                letterSpacing: "3px",
                color: "#f0ede8",
              }}
            >
              KAKAK DEWA
            </div>
            <div
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: ".5rem",
                letterSpacing: "3px",
                color: "#CC1F1F",
                textTransform: "uppercase",
              }}
            >
              SPORTS
            </div>
          </div>
        </a>
        {!mob && (
          <nav
            style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
          >
            {["Best Seller", "Katalog", "Lokasi"].map((l) => (
              <button
                key={l}
                onClick={() => nav(l)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6e6b67",
                  fontSize: ".84rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                }}
                onMouseOver={(e) => (e.target.style.color = "#f0ede8")}
                onMouseOut={(e) => (e.target.style.color = "#6e6b67")}
              >
                {l}
              </button>
            ))}
            <div style={{ width: 1, height: 22, background: "#252525" }} />
            {SOCIALS.map(({ href, icon, title }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid #252525",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6e6b67",
                  textDecoration: "none",
                  background: "#111",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#CC1F1F";
                  e.currentTarget.style.color = "#CC1F1F";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#252525";
                  e.currentTarget.style.color = "#6e6b67";
                }}
              >
                {icon}
              </a>
            ))}
            <a
              href={`https://wa.me/${WA}?text=${encodeURIComponent("Halo Kakak Dewa Sports, saya ingin bertanya.")}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".4rem",
                background: "#25D366",
                color: "#fff",
                padding: ".42rem .85rem",
                borderRadius: 8,
                fontSize: ".8rem",
                fontWeight: 700,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#1aab52")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#25D366")}
            >
              <WaIcon size={13} /> Hubungi Kami
            </a>
          </nav>
        )}
        {mob && (
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <a
              href={`https://wa.me/${WA}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".35rem",
                background: "#25D366",
                color: "#fff",
                padding: ".38rem .75rem",
                borderRadius: 8,
                fontSize: ".75rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#1aab52")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#25D366")}
            >
              <WaIcon size={12} /> WA
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                background: "none",
                border: "1px solid #252525",
                borderRadius: 8,
                width: 38,
                height: 38,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                cursor: "pointer",
                padding: "0 10px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    width: "100%",
                    height: 2,
                    background: "#f0ede8",
                    borderRadius: 1,
                  }}
                />
              ))}
            </button>
          </div>
        )}
      </header>
      {mob && menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 66,
            left: 0,
            right: 0,
            zIndex: 499,
            background: "rgba(8,8,8,0.98)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid #252525",
            padding: "1rem 1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: ".25rem",
          }}
        >
          {["Best Seller", "Katalog", "Lokasi"].map((l) => (
            <button
              key={l}
              onClick={() => nav(l)}
              style={{
                background: "none",
                border: "none",
                borderBottom: "1px solid #1a1a1a",
                color: "#f0ede8",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                textAlign: "left",
                padding: ".85rem 0",
                width: "100%",
              }}
            >
              {l}
            </button>
          ))}
          <div style={{ display: "flex", gap: ".6rem", marginTop: ".75rem" }}>
            {SOCIALS.map(({ href, icon, title }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".4rem",
                  padding: ".5rem .85rem",
                  borderRadius: 8,
                  border: "1px solid #252525",
                  color: "#6e6b67",
                  textDecoration: "none",
                  fontSize: ".8rem",
                  fontWeight: 600,
                  background: "#111",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                {icon} {title}
              </a>
            ))}
          </div>
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent("Halo Kakak Dewa Sports, saya ingin bertanya.")}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: ".5rem",
              background: "#25D366",
              color: "#fff",
              padding: ".75rem",
              borderRadius: 10,
              fontSize: ".9rem",
              fontWeight: 700,
              textDecoration: "none",
              marginTop: ".25rem",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#1aab52")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#25D366")}
          >
            <WaIcon size={16} /> Hubungi via WhatsApp
          </a>
        </div>
      )}
    </>
  );
};

// ── HERO ──
const Hero = ({ total }) => (
  <section
    style={{
      position: "relative",
      textAlign: "center",
      padding: "4.5rem 2rem 3.5rem",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 900,
        height: 450,
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse 65% 55% at 50% 0%, rgba(204,31,31,.16) 0%, transparent 70%)",
      }}
    />
    <div style={{ position: "relative", zIndex: 1 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: ".5rem",
          fontFamily: "'DM Mono',monospace",
          fontSize: ".65rem",
          letterSpacing: "2.5px",
          color: "#CC1F1F",
          background: "rgba(204,31,31,.1)",
          border: "1px solid rgba(204,31,31,.28)",
          padding: ".28rem .85rem",
          borderRadius: 2,
          textTransform: "uppercase",
          marginBottom: "1.5rem",
        }}
      >
        ⚙ Senapan Angin Terpercaya Indonesia
      </div>
      <div
        style={{
          fontSize: "7rem",
          lineHeight: 1,
          display: "block",
          marginBottom: "1rem",
          filter: "drop-shadow(0 0 24px rgba(204,31,31,.4))",
          animation: "float 4.5s ease-in-out infinite",
        }}
      >
        <img
          src={KakakDewaLogo}
          alt="Kakak Dewa Sports"
          style={{
            width: "clamp(15rem,37.5vw,22rem)",
            objectFit: "contain",
            display: "block",
            margin: "0 auto",
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "block";
          }}
        />
        <span style={{ display: "none", fontSize: "7rem", lineHeight: 1 }}>
          🏹
        </span>
      </div>
      <h1
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          letterSpacing: "4px",
          lineHeight: 0.93,
          fontSize: "clamp(3rem,7.5vw,6.5rem)",
          marginBottom: "1rem",
        }}
      >
        KAKAK DEWA
        <br />
        <span style={{ color: "#CC1F1F" }}>SPORTS</span>
      </h1>
      <p
        style={{
          color: "#6e6b67",
          fontSize: ".93rem",
          lineHeight: 1.75,
          maxWidth: 460,
          margin: "0 auto 2.25rem",
        }}
      >
        Toko senapan angin terlengkap & terpercaya di Lubuklinggau.
        <br />
        PCP, Uklik, Bocap, Gejluk — harga terbaik, gratis ongkir.
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2.75rem",
        }}
      >
        {[
          { ico: "🏆", label: "Toko Senapan Terpercaya", a: "#CC1F1F" },
          { ico: "💰", label: "Garansi Harga Termurah", a: "#c8a84b" },
          { ico: "🚚", label: "Gratis Ongkir se-Indonesia", a: "#2ecc71" },
        ].map(({ ico, label, a }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".55rem",
              background: "#111",
              border: "1px solid #252525",
              borderRadius: 30,
              padding: ".45rem 1.25rem",
              fontSize: ".79rem",
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: `${a}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: ".85rem",
              }}
            >
              {ico}
            </div>
            {label}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "inline-flex",
          border: "1px solid #252525",
          borderRadius: 12,
          overflow: "hidden",
          background: "#111",
          maxWidth: "100%",
        }}
      >
        {[
          { num: `${total}+`, lbl: "Produk" },
          { num: "4", lbl: "Jenis" },
          { num: "100%", lbl: "Amanah" },
          { num: "FREE", lbl: "Ongkir" },
        ].map(({ num, lbl }, i) => (
          <div
            key={lbl}
            style={{
              padding: "1rem clamp(.75rem,3vw,2rem)",
              textAlign: "center",
              borderRight: i < 3 ? "1px solid #252525" : "none",
            }}
          >
            <span
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: "clamp(1.4rem,4vw,1.9rem)",
                color: "#CC1F1F",
                letterSpacing: "2px",
                display: "block",
              }}
            >
              {num}
            </span>
            <span
              style={{
                fontSize: "clamp(.55rem,2vw,.65rem)",
                color: "#6e6b67",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {lbl}
            </span>
          </div>
        ))}
      </div>
    </div>
    <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}`}</style>
  </section>
);

// ── CAROUSEL ──
const Carousel = ({ products, onDetail }) => {
  const [idx, setIdx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const timerRef = useRef(null);

  const bsList = products.filter((p) => p.isBestSeller) || products.slice(0, 5);
  const total = bsList.length;

  const go = useCallback(
    (i) => {
      const next = ((i % total) + total) % total;
      setIdx(next);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(
        () => setIdx((x) => (x + 1) % total),
        5000,
      );
    },
    [total],
  );

  useEffect(() => {
    timerRef.current = setInterval(() => setIdx((x) => (x + 1) % total), 5000);
    return () => clearInterval(timerRef.current);
  }, [total]);

  const onDragStart = (e) => {
    dragStart.current = e.clientX ?? e.touches?.[0]?.clientX;
    setDragging(true);
  };
  const onDragEnd = (e) => {
    if (!dragging || dragStart.current === null) return;
    const x = e.clientX ?? e.changedTouches?.[0]?.clientX ?? dragStart.current;
    if (Math.abs(dragStart.current - x) > 40)
      go(idx + (dragStart.current - x > 0 ? 1 : -1));
    setDragging(false);
    dragStart.current = null;
  };

  // posisi per offset dari tengah
  const CFG = {
    0: { x: 0, scale: 1, ry: 0, z: 100, op: 1, blur: 0 },
    1: { x: 290, scale: 0.78, ry: -28, z: 50, op: 0.82, blur: 1 },
    "-1": { x: -290, scale: 0.78, ry: 28, z: 50, op: 0.82, blur: 1 },
    2: { x: 490, scale: 0.58, ry: -42, z: 10, op: 0.48, blur: 2.5 },
    "-2": { x: -490, scale: 0.58, ry: 42, z: 10, op: 0.48, blur: 2.5 },
  };

  // warna unik per card buat bg (karena di artifact tidak ada foto produk)
  const CARD_COLORS = [
    ["#1a0505", "#CC1F1F"],
    ["#051a0a", "#1a8c3a"],
    ["#05101a", "#1a5c8c"],
    ["#1a1205", "#8c6e1a"],
    ["#15051a", "#7c1a8c"],
  ];

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "3rem 2rem 2rem",
        scrollMarginTop: 40,
      }}
      id="best-seller"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: "1.7rem",
            letterSpacing: "3px",
          }}
        >
          BEST SELLER
        </div>
        <span
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: ".63rem",
            letterSpacing: "2px",
            color: "#CC1F1F",
            border: "1px solid rgba(204,31,31,.3)",
            background: "rgba(204,31,31,.1)",
            padding: ".22rem .6rem",
            borderRadius: 3,
            textTransform: "uppercase",
          }}
        >
          🔥 Paling Diminati
        </span>
      </div>

      {/* 3D Stage */}
      <div
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
        style={{
          position: "relative",
          height: 420,
          perspective: "1200px",
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
          marginBottom: "2rem",
        }}
      >
        {/* Arrow buttons */}
        {[
          { dir: -1, side: "left", label: "‹" },
          { dir: 1, side: "right", label: "›" },
        ].map(({ dir, side, label }) => (
          <button
            key={side}
            onClick={() => go(idx + dir)}
            style={{
              position: "absolute",
              [side]: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 200,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontSize: "1.4rem",
              backdropFilter: "blur(8px)",
              transition: "background .3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(204,31,31,.6)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
            }
          >
            {label}
          </button>
        ))}

        {/* Cards */}
        {bsList.map((p, i) => {
          const raw = (((i - idx + total) % total) + total) % total;
          const norm = raw > total / 2 ? raw - total : raw;
          const cfg = CFG[String(norm)];
          if (!cfg) return null;
          const isActive = norm === 0;
          const [bg, accent] = CARD_COLORS[i % CARD_COLORS.length];

          return (
            <div
              key={p.id}
              onClick={() => (Math.abs(norm) > 0 ? go(i) : onDetail(p))}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                // width: 340,
                width: 380,
                height: 380,
                marginLeft: -190,
                marginTop: -190,
                borderRadius: 18,
                overflow: "hidden",
                cursor: "pointer",
                transform: `translateX(${cfg.x}px) scale(${cfg.scale}) rotateY(${cfg.ry}deg) translateZ(${cfg.z}px)`,
                opacity: cfg.op,
                filter: cfg.blur > 0 ? `blur(${cfg.blur}px)` : "none",
                transition: dragging
                  ? "none"
                  : "all .55s cubic-bezier(0.25,0.46,0.45,0.94)",
                zIndex: isActive ? 100 : Math.abs(norm) === 1 ? 50 : 10,
                transformStyle: "preserve-3d",
                boxShadow: isActive
                  ? "0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(204,31,31,.35)"
                  : "0 16px 40px rgba(0,0,0,.45)",
              }}
            >
              {/* Card background dengan warna unik + emoji besar */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse at 50% 35%, ${accent}40 0%, ${bg} 65%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Card background */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse at 50% 35%, ${accent}40 0%, ${bg} 65%)`,
                  }}
                >
                  {p.images?.[0] ? (
                    <img
                      src={p.images?.[0]}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        display: "block", // ← KUNCI: hilangkan baseline gap
                        opacity: isActive ? 1 : 0.75,
                        filter: isActive ? "none" : "grayscale(20%)",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "7.5rem",
                        opacity: isActive ? 0.9 : 0.7,
                      }}
                    >
                      {p.emoji}
                    </div>
                  )}
                </div>
              </div>

              {/* Subtle grid texture overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Active glow */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse at 50% 100%, rgba(204,31,31,.22) 0%, transparent 65%)",
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Bottom gradient + text */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,.95) 0%, rgba(0,0,0,.6) 42%, rgba(0,0,0,.1) 65%, transparent 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: isActive ? "1.4rem" : "1rem",
                }}
              >
                {isActive && (
                  <span
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: ".55rem",
                      letterSpacing: "2px",
                      color: "#CC1F1F",
                      background: "rgba(204,31,31,.18)",
                      border: "1px solid rgba(204,31,31,.4)",
                      borderRadius: 3,
                      padding: ".15rem .5rem",
                      textTransform: "uppercase",
                      marginBottom: ".5rem",
                      width: "fit-content",
                    }}
                  >
                    🔥 Best Seller #{i + 1}
                  </span>
                )}
                <div
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: isActive ? "1.55rem" : "1.05rem",
                    letterSpacing: "2px",
                    color: "#fff",
                    lineHeight: 1.1,
                    marginBottom: ".35rem",
                    textShadow: "0 2px 8px rgba(0,0,0,.9)",
                  }}
                >
                  {p.name}
                </div>
                {isActive && (
                  <>
                    <div
                      style={{
                        fontSize: ".76rem",
                        color: "rgba(255,255,255,.68)",
                        lineHeight: 1.55,
                        marginBottom: ".85rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.desc}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: ".5rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Bebas Neue',sans-serif",
                          fontSize: "1.5rem",
                          color: "#CC1F1F",
                          letterSpacing: "1px",
                          textShadow: "0 0 20px rgba(204,31,31,.35)",
                        }}
                      >
                        {fmt(p.price)}
                      </span>
                      <a
                        href={waLink(p)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: ".35rem",
                          background: "#25D366",
                          color: "#fff",
                          textDecoration: "none",
                          padding: ".45rem .9rem",
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: ".78rem",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = "#1aab52")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = "#25D366")
                        }
                      >
                        <WaIcon size={13} /> Pesan
                      </a>
                    </div>
                  </>
                )}
                {Math.abs(norm) === 1 && (
                  <div
                    style={{
                      fontSize: ".7rem",
                      color: "rgba(255,255,255,.45)",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {fmt(p.price)}
                  </div>
                )}
              </div>

              {/* Active border ring */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 18,
                    border: "1px solid rgba(204,31,31,.5)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: ".4rem" }}>
        {bsList.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            style={{
              width: i === idx ? 22 : 8,
              height: 8,
              borderRadius: 4,
              background: i === idx ? "#CC1F1F" : "rgba(255,255,255,.2)",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ── PRODUCT IMAGES ──
const IMG_EXT = "png";
const ProductThumb = ({ p }) => {
  const [err, setErr] = useState(false);
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1/1",
        background: err ? "linear-gradient(135deg,#191919,#111)" : "#f8f8f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "3.25rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {err ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 70% 30%,rgba(204,31,31,.07) 0%,transparent 60%)",
            }}
          />
          <span style={{ position: "relative", zIndex: 1 }}>{p.emoji}</span>
        </>
      ) : (
        <img
          src={p.images?.[0]}
          alt={p.name}
          onError={() => setErr(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: ".5rem",
            backgroundColor: "#f1f1f1",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      )}
    </div>
  );
};

const ModalImageSlider = ({ p }) => {
  const [errs, setErrs] = useState({});
  useEffect(() => {
    setIdx(0);
    setErrs({});
  }, [p.id]);
  const slugs = p.images?.length ? p.images : [];
  const [idx, setIdx] = useState(0);
  const total = slugs.length;

  const src = slugs[idx];

  const hasErr = errs[slugs];
  const label =
    p.variantLabels?.[idx] ?? (total > 1 ? `Varian ${idx + 1}` : null);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {hasErr ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "7rem",
            zIndex: 2,
            position: "relative",
          }}
        >
          <span>{p.emoji}</span>
        </div>
      ) : (
        <img
          key={src}
          src={src}
          alt={`${p.name}${label ? ` — ${label}` : ""}`}
          onError={() => setErrs((e) => ({ ...e, [slugs]: true }))}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "relative",
            zIndex: 2,
            display: "block",
            padding: "1rem",
            backgroundColor: "#f1f1f1",
          }}
        />
      )}
      {total > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + total) % total)}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "rgba(0,0,0,.55)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "50%",
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontSize: "1.1rem",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(204,31,31,.75)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "rgba(0,0,0,.55)")
            }
          >
            ‹
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % total)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "rgba(0,0,0,.55)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "50%",
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontSize: "1.1rem",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(204,31,31,.75)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "rgba(0,0,0,.55)")
            }
          >
            ›
          </button>
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              background: "rgba(0,0,0,.65)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 20,
              padding: ".25rem .75rem",
            }}
          >
            {label && (
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".72rem",
                  fontWeight: 600,
                  color: "#f0ede8",
                }}
              >
                {label}
              </span>
            )}
            {label && (
              <span
                style={{
                  width: 1,
                  height: 10,
                  background: "rgba(255,255,255,.25)",
                }}
              />
            )}
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: ".65rem",
                color: "#f0ede8",
              }}
            >
              {idx + 1} / {total}
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              display: "flex",
              gap: ".3rem",
            }}
          >
            {slugs.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                style={{
                  width: i === idx ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === idx ? "#CC1F1F" : "rgba(0,0,0,.55)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── PRODUCT CARD ──
const ProductCard = ({ p, idx, onDetail }) => (
  <div
    onClick={() => onDetail(p)}
    style={{
      background: "#111",
      border: "1px solid #252525",
      borderRadius: 12,
      overflow: "hidden",
      cursor: "pointer",
      position: "relative",
      animation: `fadeUp .3s ease ${idx * 0.05}s both`,
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.borderColor = "#CC1F1F";
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 16px 48px rgba(204,31,31,.12)";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.borderColor = "#252525";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <Badge badge={p.badge} />
    <ProductThumb p={p} />
    <div style={{ padding: ".95rem 1.05rem 1.05rem" }}>
      <div
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: ".6rem",
          color: "#CC1F1F",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: ".22rem",
        }}
      >
        {p.brand}
      </div>
      <div
        style={{
          fontSize: ".9rem",
          fontWeight: 600,
          lineHeight: 1.3,
          marginBottom: ".55rem",
        }}
      >
        {p.name}
      </div>
      <div
        style={{
          display: "flex",
          gap: ".38rem",
          flexWrap: "wrap",
          marginBottom: ".65rem",
        }}
      >
        {[p.caliber, (p.type || "").toUpperCase()].map((t) => (
          <span
            key={t}
            style={{
              fontSize: ".63rem",
              padding: ".16rem .42rem",
              background: "#191919",
              border: "1px solid #252525",
              borderRadius: 4,
              color: "#6e6b67",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #252525",
          paddingTop: ".7rem",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: "1.25rem",
              letterSpacing: "1px",
              color: "#CC1F1F",
            }}
          >
            {fmt(p.price)}
          </div>
          <div style={{ fontSize: ".6rem", color: "#6e6b67", marginTop: -2 }}>
            Harga satuan
          </div>
        </div>
        <a
          href={waLink(p)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".3rem",
            background: "#25D366",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: ".38rem .62rem",
            fontSize: ".7rem",
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "none",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#1aab52")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#25D366")}
        >
          <WaIcon size={12} /> Order
        </a>
      </div>
    </div>
  </div>
);

// ── CATALOG ──
const Catalog = ({ products, onDetail }) => {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("");
  const [activeType, setActiveType] = useState("all");
  const filtered = products
    .filter((p) => {
      const q = query.toLowerCase();
      return (
        (!q ||
          [p.name, p.brand, p.type, p.caliber]
            .filter(Boolean)
            .some((s) => s.toLowerCase().includes(q))) &&
        (activeType === "all" ||
          p.type?.toLowerCase() === activeType.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sort === "pa") return a.price - b.price;
      if (sort === "pd") return b.price - a.price;
      if (sort === "na") return a.name.localeCompare(b.name);
      if (sort === "nd") return b.name.localeCompare(a.name);
      return 0;
    });
  return (
    <section
      style={{ maxWidth: 1400, margin: "0 auto", padding: "3rem 2rem" }}
      id="katalog"
    >
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} select option{background:#191919;}`}</style>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "1.5rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: "1.7rem",
              letterSpacing: "3px",
            }}
          >
            KATALOG PRODUK
          </div>
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: ".7rem",
              color: "#6e6b67",
              marginTop: ".25rem",
            }}
          >
            Menampilkan {filtered.length} dari {products.length} produk
          </div>
        </div>
      </div>
      <div
        style={{
          background: "#111",
          border: "1px solid #252525",
          borderRadius: 12,
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          display: "flex",
          gap: ".85rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6e6b67",
              pointerEvents: "none",
            }}
          >
            <SearchIcon />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, brand, kaliber..."
            style={{
              width: "100%",
              background: "#191919",
              border: "1px solid #252525",
              borderRadius: 8,
              color: "#f0ede8",
              fontFamily: "'DM Sans',sans-serif",
              fontSize: ".87rem",
              padding: ".58rem .8rem .58rem 2.3rem",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#CC1F1F")}
            onBlur={(e) => (e.target.style.borderColor = "#252525")}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            background: "#191919",
            border: "1px solid #252525",
            borderRadius: 8,
            color: "#f0ede8",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: ".84rem",
            padding: ".58rem .75rem",
            outline: "none",
            cursor: "pointer",
          }}
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveType(t.key)}
              style={{
                fontSize: ".73rem",
                padding: ".32rem .78rem",
                borderRadius: 20,
                border: `1px solid ${activeType === t.key ? "#CC1F1F" : "#252525"}`,
                background: activeType === t.key ? "#CC1F1F" : "transparent",
                color: activeType === t.key ? "#fff" : "#6e6b67",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: activeType === t.key ? 700 : 500,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "5rem 2rem",
            color: "#6e6b67",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>
            🔍
          </div>
          <div style={{ fontSize: "1.1rem", marginBottom: ".5rem" }}>
            Produk tidak ditemukan
          </div>
          <div style={{ fontSize: ".83rem" }}>
            Coba kata kunci lain atau reset filter
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(265px,1fr))",
            gap: "1.2rem",
          }}
        >
          {filtered.map((p, i) => (
            <ProductCard
              key={p.id || p.name}
              p={p}
              idx={i}
              onDetail={onDetail}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// ── MODAL ──
const Modal = ({ product, onClose }) => {
  const [mob, setMob] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  useEffect(() => {
    if (product) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [product, onClose]);
  if (!product) return null;
  const p = product;
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.92)",
        backdropFilter: "blur(14px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: mob ? "0" : "1rem",
        animation: "fadeIn .25s ease",
      }}
    >
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{transform:translateY(28px) scale(.97)}to{transform:translateY(0) scale(1)}}`}</style>
      <div
        style={{
          background: "#111",
          border: mob ? "none" : "1px solid #252525",
          borderRadius: mob ? "20px 20px 0 0" : 16,
          width: "100%",
          maxWidth: 980,
          maxHeight: mob ? "95vh" : "90vh",
          overflowY: "auto",
          position: mob ? "fixed" : "relative",
          bottom: mob ? 0 : "auto",
          display: "flex",
          flexDirection: mob ? "column" : "row",
          animation: "slideUp .3s ease",
        }}
      >
        <div
          style={{
            width: mob ? "100%" : "420px",
            flexShrink: 0,
            background: "#f8f8f8",
            borderRadius: mob ? "20px 20px 0 0" : "16px 0 0 16px",
            position: "relative",
            overflow: "hidden",
            aspectRatio: "1/1",
          }}
        >
          <ModalImageSlider p={p} />
        </div>
        <div
          style={{
            flex: 1,
            padding: mob ? "1.5rem 1.25rem 2rem" : "2rem 2rem 2rem 1.75rem",
            overflowY: mob ? "visible" : "auto",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "#191919",
              border: "1px solid #252525",
              borderRadius: "50%",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6e6b67",
              fontSize: ".95rem",
              zIndex: 10,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#CC1F1F";
              e.currentTarget.style.color = "#CC1F1F";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#252525";
              e.currentTarget.style.color = "#6e6b67";
            }}
          >
            ✕
          </button>
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: ".63rem",
              color: "#CC1F1F",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: ".3rem",
              marginTop: ".25rem",
            }}
          >
            {p.brand}
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: mob ? "1.75rem" : "2rem",
              letterSpacing: "2px",
              lineHeight: 1.05,
              marginBottom: ".75rem",
              paddingRight: "2.5rem",
            }}
          >
            {p.name}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: ".62rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                padding: ".22rem .65rem",
                background: "rgba(204,31,31,.12)",
                border: "1px solid rgba(204,31,31,.3)",
                borderRadius: 4,
                color: "#CC1F1F",
              }}
            >
              {(p.type || "").toUpperCase()}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: mob ? "2.2rem" : "2.6rem",
              color: "#CC1F1F",
              letterSpacing: "2px",
              marginBottom: "1.25rem",
              lineHeight: 1,
            }}
          >
            {fmt(p.price)}
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: ".7rem",
                color: "#6e6b67",
                fontWeight: 400,
                letterSpacing: 0,
                marginLeft: ".5rem",
              }}
            >
              / unit
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: ".5rem",
              marginBottom: "1.1rem",
            }}
          >
            {[
              ["Kaliber", p.caliber],
              ["Sistem", p.system],
              ["Magasin", p.mag],
              ["Berat", p.berat],
              ["Jenis", (p.type || "").toUpperCase()],
              ["Status", "✓ Tersedia"],
            ].map(([l, v]) => (
              <div
                key={l}
                style={{
                  background: "#191919",
                  border: "1px solid #252525",
                  borderRadius: 8,
                  padding: ".6rem .75rem",
                }}
              >
                <div
                  style={{
                    fontSize: ".56rem",
                    color: "#6e6b67",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: ".15rem",
                    fontFamily: "'DM Mono',monospace",
                  }}
                >
                  {l}
                </div>
                <div
                  style={{
                    fontSize: ".84rem",
                    fontWeight: 600,
                    color: l === "Status" ? "#2ecc71" : "#f0ede8",
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              color: "#6e6b67",
              fontSize: ".84rem",
              lineHeight: 1.75,
              marginBottom: "1.5rem",
              padding: ".85rem 1rem",
              background: "#191919",
              borderRadius: 8,
              borderLeft: "3px solid #CC1F1F",
              flexGrow: 1,
            }}
          >
            {p.desc}
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}
          >
            <a
              href={waLink(p)}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: ".6rem",
                background: "#25D366",
                color: "#fff",
                textDecoration: "none",
                padding: ".85rem 1.5rem",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: ".94rem",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#1aab52")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#25D366")}
            >
              <WaIcon size={18} /> Pesan via WhatsApp
            </a>
            <button
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: ".45rem",
                background: "transparent",
                color: "#6e6b67",
                padding: ".75rem 1.25rem",
                borderRadius: 10,
                fontSize: ".84rem",
                border: "1px solid #252525",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#6e6b67";
                e.currentTarget.style.color = "#f0ede8";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#252525";
                e.currentTarget.style.color = "#6e6b67";
              }}
            >
              ← Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── LOCATION ──
const Location = () => (
  <section
    style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem 2rem 5rem" }}
    id="lokasi"
  >
    <div
      style={{
        fontFamily: "'Bebas Neue',sans-serif",
        fontSize: "1.7rem",
        letterSpacing: "3px",
        marginBottom: "1.25rem",
      }}
    >
      LOKASI TOKO
    </div>
    <div
      style={{
        background: "#111",
        border: "1px solid #252525",
        borderRadius: 14,
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <div style={{ padding: "2.5rem" }}>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: "1.5rem",
            letterSpacing: "3px",
            color: "#CC1F1F",
            marginBottom: ".2rem",
          }}
        >
          KAKAK DEWA SPORTS
        </div>
        <div
          style={{
            color: "#6e6b67",
            fontSize: ".81rem",
            marginBottom: "1.75rem",
          }}
        >
          Kunjungi kami — lihat langsung sebelum memutuskan
        </div>
        {[
          {
            icon: <PinIcon />,
            text: "Toko Margaria, PV37+J62, Jl. Jend. Sudirman, Ps. Permiri,\nKec. Lubuk Linggau Bar. II, Kota Lubuklinggau,\nSumatera Selatan 31611",
          },
          {
            icon: <ClockIcon />,
            text: "Senin – Sabtu: 09.00 – 18.00 WIB\nMinggu: 10.00 – 15.00 WIB",
          },
          { icon: <PhoneIcon />, text: "0821-2437-7830" },
        ].map(({ icon, text }) => (
          <div
            key={text}
            style={{
              display: "flex",
              gap: ".7rem",
              alignItems: "flex-start",
              marginBottom: ".95rem",
              fontSize: ".86rem",
              color: "#6e6b67",
              lineHeight: 1.55,
            }}
          >
            <div style={{ color: "#CC1F1F", flexShrink: 0, marginTop: 2 }}>
              {icon}
            </div>
            <span style={{ whiteSpace: "pre-line" }}>{text}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            gap: ".55rem",
            marginTop: "1.6rem",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              href: `https://wa.me/${WA}?text=${encodeURIComponent("Halo Kakak Dewa Sports")}`,
              label: "WhatsApp",
              icon: <WaIcon size={13} />,
              wa: true,
            },
            {
              href: "https://www.instagram.com/kakakdewa.sport/",
              label: "Instagram",
              icon: <IgIcon />,
              wa: false,
            },
            {
              href: "https://www.facebook.com/profile.php?id=61588663539438",
              label: "Facebook",
              icon: <FbIcon />,
              wa: false,
            },
            {
              href: "https://www.google.com/maps?q=TOKO+MARGARIA+Lubuklinggau",
              label: "Maps",
              icon: <PinIcon />,
              wa: false,
            },
          ].map(({ href, label, icon, wa }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".4rem",
                padding: ".42rem .85rem",
                borderRadius: 8,
                fontSize: ".77rem",
                fontWeight: 600,
                textDecoration: "none",
                border: "1px solid",
                ...(wa
                  ? {
                      background: "#25D366",
                      color: "#fff",
                      borderColor: "#25D366",
                    }
                  : {
                      background: "#191919",
                      color: "#6e6b67",
                      borderColor: "#252525",
                    }),
              }}
              onMouseOver={(e) => {
                if (!wa) {
                  e.currentTarget.style.borderColor = "#CC1F1F";
                  e.currentTarget.style.color = "#CC1F1F";
                  e.currentTarget.style.background = "#CC1F1F18";
                } else {
                  e.currentTarget.style.borderColor = "#1aab52";
                  e.currentTarget.style.background = "#1aab52";
                }
              }}
              onMouseOut={(e) => {
                if (!wa) {
                  e.currentTarget.style.borderColor = "#252525";
                  e.currentTarget.style.color = "#6e6b67";
                  e.currentTarget.style.background = "#191919";
                } else {
                  e.currentTarget.style.borderColor = "#25D366";
                  e.currentTarget.style.background = "#25D366";
                }
              }}
            >
              {icon} {label}
            </a>
          ))}
        </div>
      </div>
      <div
        style={{
          borderLeft: "1px solid #252525",
          display: "flex",
          alignItems: "stretch",
          minHeight: 300,
        }}
      >
        <iframe
          src="https://maps.google.com/maps?q=TOKO+MARGARIA+Lubuklinggau&output=embed"
          style={{
            width: "100%",
            border: "none",
            display: "block",
            minHeight: 300,
          }}
          allowFullScreen
          loading="lazy"
          title="Lokasi Kakak Dewa Sports"
        />
      </div>
    </div>
  </section>
);

// ── FOOTER ──
const Footer = () => (
  <footer style={{ borderTop: "1px solid #252525", padding: "2rem" }}>
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
        <Logo size={34} />
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: ".95rem",
              letterSpacing: "2px",
            }}
          >
            KAKAK DEWA SPORTS
          </div>
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: ".5rem",
              letterSpacing: "2px",
              color: "#CC1F1F",
            }}
          >
            LUBUKLINGGAU · SUMATERA SELATAN
          </div>
        </div>
      </div>
      <div
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: ".68rem",
          color: "#333",
        }}
      >
        © 2026 <span style={{ color: "#6e6b67" }}>Kakak Dewa Sports</span> ·
        Harga dapat berubah · Transaksi via WhatsApp
      </div>
    </div>
  </footer>
);

// ── APP ──
export default function App() {
  const [modal, setModal] = useState(null);
  const [products, setProducts] = useState([]);
  // const products = PRODUCTS;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    });

    return () => unsubscribe();
  }, []);

  const scrollTo = (label) => {
    const map = {
      "Best Seller": "best-seller",
      Katalog: "katalog",
      Lokasi: "lokasi",
    };
    document.getElementById(map[label])?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div
      style={{
        background: "#080808",
        color: "#f0ede8",
        minHeight: "100vh",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#080808}
        ::-webkit-scrollbar-thumb{background:#252525;border-radius:3px}
        body{background:#080808}
      `}</style>
      <Header onNavClick={scrollTo} />
      <Hero total={products.length} />
      <Carousel products={products} onDetail={setModal} />
      <Catalog products={products} onDetail={setModal} />
      <Location />
      <Footer />
      <Modal product={modal} onClose={() => setModal(null)} />
    </div>
  );
}
