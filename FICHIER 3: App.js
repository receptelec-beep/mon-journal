/**@jsxImportSource https://esm.sh/react*/
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
import { useState, useRef, useEffect, useCallback } from "react";

// ── PALETTE ──
const C = {
  bg: "#0f0e0d",
  surface: "#1c1a17",
  card: "#242018",
  border: "#3a3428",
  gold: "#e8a642",
  goldDim: "rgba(232,166,66,0.12)",
  red: "#e05030",
  green: "#5aab6e",
  text: "#f0ead8",
  muted: "#8a7d68",
  light: "#c8bfa8",
};

const S = {
  app: {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
    fontFamily: "'Georgia', serif",
    display: "flex",
    flexDirection: "column",
    maxWidth: 480,
    margin: "0 auto",
  },
  header: {
    background: C.surface,
    borderBottom: `1px solid ${C.border}`,
    padding: "16px 20px 12px",
    flexShrink: 0,
  },
  h1: {
    fontSize: 22,
    fontWeight: 700,
    color: C.gold,
    letterSpacing: "-0.3px",
    margin: 0,
  },
  subtitle: { fontSize: 12, color: C.muted, marginTop: 2, fontStyle: "italic" },
  tabs: {
    display: "flex",
    background: C.surface,
    borderBottom: `1px solid ${C.border}`,
    flexShrink: 0,
  },
  tab: (active) => ({
    flex: 1,
    padding: "12px 4px 10px",
    background: "none",
    border: "none",
    borderBottom: `3px solid ${active ? C.gold : "transparent"}`,
    color: active ? C.gold : C.muted,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  }),
  content: { flex: 1, overflowY: "auto", padding: 16 },
  card: {
    background: C.card,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardPad: { padding: "14px 16px" },
  btn: (col = C.gold) => ({
    background: col,
    color: "#0f0e0d",
    border: "none",
    borderRadius: 10,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.15s",
  }),
  btnOutline: (col = C.muted) => ({
    background: "transparent",
    color: col,
    border: `1.5px solid ${col}`,
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  }),
  input: {
    width: "100%",
    background: C.surface,
    border: `1.5px solid ${C.border}`,
    borderRadius: 10,
    padding: "10px 14px",
    color: C.text,
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    marginBottom: 10,
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "10px 14px",
    color: C.text,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    resize: "none",
    minHeight: 70,
    lineHeight: 1.6,
    boxSizing: "border-box",
  },
  empty: {
    textAlign: "center",
    padding: "40px 20px",
    color: C.muted,
    fontSize: 14,
    lineHeight: 1.7,
  },
  row: { display: "flex", gap: 8, alignItems: "center" },
  spaceBetween: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 },
  badge: (col = C.gold) => ({
    background: col + "22",
    color: col,
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 20,
    letterSpacing: 0.5,
  }),
};

// ── UTILS ──
function fmtDate(d = new Date()) {
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" });
}
function fmtTime(d = new Date()) {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function fmtDur(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ── TOAST ──
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: C.text, color: C.bg, padding: "10px 22px", borderRadius: 30,
      fontSize: 14, fontWeight: 600, zIndex: 9999, whiteSpace: "nowrap",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)", maxWidth: "90vw",
      animation: "fadeUp 0.3s ease",
    }}>
      {msg}
    </div>
  );
}

// ── MIC BUTTON ──
function MicButton({ recording, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 90, height: 90, borderRadius: "50%",
      background: recording ? C.red : C.gold,
      border: "none", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 36, margin: "0 auto",
      boxShadow: recording
        ? `0 0 0 8px ${C.red}33, 0 0 0 16px ${C.red}11`
        : `0 4px 24px ${C.gold}44`,
      transition: "all 0.2s",
      animation: recording ? "ripple 1.3s ease infinite" : "none",
    }}>
      {recording ? "⏹" : "🎙"}
    </button>
  );
}

// ── EMAIL MODAL ──
function EmailModal({ photo, onClose }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Photo depuis Mon Journal");

  if (!photo) return null;

  function send() {
    if (!to.trim()) { alert("Veuillez entrer une adresse e-mail"); return; }

    const comment = photo.comment || "";
    const date = `${fmtDate(photo.date)} à ${fmtTime(photo.date)}`;
    const body = [
      comment && `💬 Commentaire : ${comment}`,
      `📅 Date : ${date}`,
      "",
      "— Envoyé depuis Mon Journal",
    ].filter(Boolean).join("\n");

    // Try Web Share API first (best on iPhone — shares photo as file)
    if (navigator.share) {
      fetch(photo.src)
        .then(r => r.blob())
        .then(blob => {
          const file = new File([blob], "photo-journal.jpg", { type: blob.type });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ title: subject, text: body, files: [file] })
              .then(() => { onClose(); })
              .catch(() => fallbackMailto(to, subject, body));
          } else {
            fallbackMailto(to, subject, body);
          }
        })
        .catch(() => fallbackMailto(to, subject, body));
    } else {
      fallbackMailto(to, subject, body);
    }
  }

  function fallbackMailto(to, subject, body) {
    const link = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = link;
    onClose();
  }

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div style={{
        background: C.surface, borderRadius: "22px 22px 0 0",
        padding: "24px 20px 36px", width: "100%", maxWidth: 480,
        border: `1px solid ${C.border}`, borderBottom: "none",
      }}>
        <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>📧 Envoyer par e-mail</p>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
          La photo et le commentaire seront partagés
        </p>

        {/* Preview */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16,
          background: C.card, borderRadius: 12, padding: 12, border: `1px solid ${C.border}` }}>
          <img src={photo.src} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, color: C.light, lineHeight: 1.5 }}>
              {photo.comment || <span style={{ color: C.muted, fontStyle: "italic" }}>Aucun commentaire</span>}
            </p>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{fmtDate(photo.date)}</p>
          </div>
        </div>

        <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Destinataire</label>
        <input
          style={S.input}
          type="email"
          placeholder="exemple@gmail.com"
          value={to}
          onChange={e => setTo(e.target.value)}
          autoComplete="email"
          inputMode="email"
        />

        <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Objet</label>
        <input
          style={{ ...S.input, marginBottom: 16 }}
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.btnOutline(C.muted), flex: 1, padding: "12px" }} onClick={onClose}>
            Annuler
          </button>
          <button style={{ ...S.btn(C.gold), flex: 2, padding: "12px" }} onClick={send}>
            📤 Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ── VOICE TAB ──
// ══════════════════════════════════════
function VoiceTab({ showToast }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [entries, setEntries] = useState([]);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [mode, setMode] = useState("stt"); // "stt" or "audio"

  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recRef = useRef(null);
  const finalRef = useRef("");

  // ── AUDIO RECORDING ──
  async function startAudio() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/mp4" });
        const url = URL.createObjectURL(blob);
        setEntries(prev => [{ id: Date.now(), type: "audio", url, dur: seconds, date: new Date() }, ...prev]);
        stream.getTracks().forEach(t => t.stop());
        showToast("✅ Enregistrement sauvegardé !");
      };
      mr.start(100);
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
      showToast("🎙 Enregistrement démarré");
    } catch (err) {
      if (err.name === "NotAllowedError") {
        showToast("❌ Micro refusé — voir aide ci-dessous");
        setEntries(prev => prev.find(e => e.id === "help") ? prev : [
          { id: "help", type: "help" }, ...prev
        ]);
      } else {
        showToast("❌ " + err.message);
      }
    }
  }

  function stopAudio() {
    mediaRef.current?.stop();
    clearInterval(timerRef.current);
    setRecording(false);
  }

  // ── SPEECH TO TEXT ──
  function startSTT() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (isIOS) { showToast("❌ Non supporté par ce navigateur"); return; }
    const r = new SR();
    r.lang = "fr-FR";
    r.interimResults = true;
    r.continuous = true;
    finalRef.current = transcript;
    r.onresult = (e) => {
      let fin = finalRef.current, tmp = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        e.results[i].isFinal ? (fin += e.results[i].transcript + " ") : (tmp += e.results[i].transcript);
      }
      finalRef.current = fin;
      setTranscript(fin);
      setInterim(tmp);
    };
    r.onerror = (e) => {
      showToast(e.error === "not-allowed" ? "❌ Micro refusé — autorisez dans les Réglages" : "❌ Erreur : " + e.error);
      setListening(false);
    };
    r.onend = () => { if (recRef.current) try { r.start(); } catch (_) {} };
    recRef.current = r;
    r.start();
    setListening(true);
    showToast("🎙 Dictée démarrée, parlez !");
  }

  function stopSTT() {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
    setInterim("");
    showToast("⏹ Dictée arrêtée");
  }

  function saveSTT() {
    const text = (transcript + interim).trim();
    if (!text) { showToast("Rien à sauvegarder"); return; }
    stopSTT();
    setEntries(prev => [{ id: Date.now(), type: "text", text, date: new Date() }, ...prev]);
    setTranscript("");
    setInterim("");
    finalRef.current = "";
    showToast("✅ Idée sauvegardée !");
  }

  function delEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  return (
    <div>
      {/* Mode selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["stt", "💬 Dicter → Texte"], ["audio", "🎵 Enregistrer audio"]].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: "10px 6px", borderRadius: 12,
            border: `1.5px solid ${mode === m ? C.gold : C.border}`,
            background: mode === m ? C.goldDim : C.card,
            color: mode === m ? C.gold : C.muted,
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* STT MODE */}
      {mode === "stt" && (
        <div style={{ ...S.card, padding: "20px 16px", textAlign: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            {listening ? "🔴 Parlez maintenant…" : "Appuyez pour commencer la dictée"}
          </p>
          <MicButton recording={listening} onClick={listening ? stopSTT : startSTT} />
          <div style={{ marginTop: 16, background: C.surface, borderRadius: 12, padding: 14,
            minHeight: 70, textAlign: "left", border: `1px solid ${C.border}` }}>
            {transcript || interim
              ? <><span style={{ color: C.text }}>{transcript}</span><span style={{ color: C.muted, fontStyle: "italic" }}>{interim}</span></>
              : <span style={{ color: C.muted, fontStyle: "italic", fontSize: 13 }}>Votre texte dicté apparaîtra ici…</span>
            }
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button style={{ ...S.btnOutline(C.muted), flex: 1 }} onClick={() => { setTranscript(""); setInterim(""); finalRef.current = ""; }}>
              Effacer
            </button>
            <button style={{ ...S.btn(C.gold), flex: 2 }} onClick={saveSTT}>
              💾 Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* AUDIO MODE */}
      {mode === "audio" && (
        <div style={{ ...S.card, padding: "20px 16px", textAlign: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            {recording ? `🔴 ${fmtDur(seconds)} en cours…` : "Appuyez pour enregistrer"}
          </p>
          <MicButton recording={recording} onClick={recording ? stopAudio : startAudio} />
          {recording && (
            <p style={{ marginTop: 12, fontSize: 28, fontWeight: 300, letterSpacing: 3, color: C.gold }}>
              {fmtDur(seconds)}
            </p>
          )}
        </div>
      )}

      {/* ENTRIES */}
      <p style={S.label}>Mes enregistrements</p>
      <div style={{ marginTop: 10 }}>
        {entries.length === 0 && (
          <div style={S.empty}>🎙<br />Aucun enregistrement<br />Dictez ou enregistrez ci-dessus</div>
        )}
        {entries.map(e => {
          if (e.type === "help") return (
            <div key="help" style={{ ...S.card, ...S.cardPad, background: "#2a1800", borderColor: C.gold + "55" }}>
              <p style={{ fontWeight: 700, color: C.gold, marginBottom: 8 }}>📱 Autoriser le micro sur iPhone</p>
              <p style={{ fontSize: 13, color: C.light, lineHeight: 1.7 }}>
                1. Ouvrez <b>Réglages</b><br />
                2. Cherchez <b>Safari</b><br />
                3. Appuyez sur <b>Microphone</b><br />
                4. Sélectionnez <b>Autoriser</b><br />
                5. Revenez ici et réessayez 🎙
              </p>
              <button style={{ ...S.btnOutline(C.muted), marginTop: 10, fontSize: 11 }} onClick={() => delEntry("help")}>
                Fermer
              </button>
            </div>
          );
          return (
            <div key={e.id} style={S.card}>
              <div style={{ ...S.cardPad, ...S.spaceBetween, paddingBottom: 8 }}>
                <span style={{ fontSize: 11, color: C.muted }}>{fmtDate(e.date)} · {fmtTime(e.date)}</span>
                <span style={S.badge(e.type === "text" ? C.gold : "#5aab6e")}>
                  {e.type === "text" ? "DICTÉE" : `AUDIO ${fmtDur(e.dur)}`}
                </span>
              </div>
              <div style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 12 }}>
                {e.type === "text"
                  ? <p style={{ fontSize: 15, lineHeight: 1.7, color: C.light }}>{e.text}</p>
                  : <audio controls src={e.url} style={{ width: "100%", accentColor: C.gold }} />
                }
                <div style={{ marginTop: 8, textAlign: "right" }}>
                  <button style={S.btnOutline(C.red)} onClick={() => delEntry(e.id)}>Supprimer</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ── PHOTOS TAB ──
// ══════════════════════════════════════
function PhotosTab({ showToast }) {
  const [photos, setPhotos] = useState([]);
  const [emailPhoto, setEmailPhoto] = useState(null);
  const inputRef = useRef(null);

  function handleFiles(e) {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setPhotos(prev => [{
          id: Date.now() + Math.random(),
          src: ev.target.result,
          comment: "",
          date: new Date(),
        }, ...prev]);
        showToast("📷 Photo ajoutée !");
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function updateComment(id, val) {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, comment: val } : p));
  }

  function delPhoto(id) {
    setPhotos(prev => prev.filter(p => p.id !== id));
    showToast("🗑 Photo supprimée");
  }

  // Prepare photo with latest comment for email modal
  function openEmail(photo) {
    setEmailPhoto(photo);
  }

  return (
    <div>
      {/* Add button */}
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          background: C.card, border: `2px dashed ${C.border}`,
          borderRadius: 18, padding: "28px 20px", textAlign: "center",
          cursor: "pointer", marginBottom: 16, transition: "all 0.2s",
        }}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
        <p style={{ fontSize: 36, marginBottom: 8 }}>📷</p>
        <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 4 }}>Ajouter une photo</p>
        <p style={{ fontSize: 13, color: C.muted }}>Galerie ou appareil photo</p>
      </div>

      {photos.length === 0 && (
        <div style={S.empty}>🖼️<br />Aucune photo pour l'instant</div>
      )}

      {photos.map(photo => (
        <div key={photo.id} style={{ ...S.card, marginBottom: 14 }}>
          {/* Image */}
          <img
            src={photo.src}
            alt="Photo"
            style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }}
          />
          <div style={S.cardPad}>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
              {fmtDate(photo.date)} · {fmtTime(photo.date)}
            </p>

            {/* Comment */}
            <textarea
              style={{ ...S.textarea, marginBottom: 12 }}
              placeholder="Écrire un commentaire sur cette photo…"
              value={photo.comment}
              onChange={e => updateComment(photo.id, e.target.value)}
              rows={3}
            />

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{ ...S.btn(C.gold), flex: 2, fontSize: 13 }}
                onClick={() => openEmail({ ...photo, comment: photos.find(p => p.id === photo.id)?.comment || "" })}
              >
                📧 Envoyer par e-mail
              </button>
              <button style={{ ...S.btnOutline(C.red), flex: 1, fontSize: 12 }} onClick={() => delPhoto(photo.id)}>
                🗑 Supprimer
              </button>
            </div>
          </div>
        </div>
      ))}

      {emailPhoto && (
        <EmailModal
          photo={{ ...emailPhoto, comment: photos.find(p => p.id === emailPhoto.id)?.comment || emailPhoto.comment }}
          onClose={() => setEmailPhoto(null)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════
// ── NOTES TAB ──
// ══════════════════════════════════════
function NotesTab({ showToast }) {
  const [notes, setNotes] = useState([]);

  function addNote() {
    setNotes(prev => [{ id: Date.now(), text: "", date: new Date() }, ...prev]);
    showToast("✏️ Nouvelle note !");
  }

  function updateNote(id, val) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text: val } : n));
  }

  function delNote(id) {
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div>
      <button style={{ ...S.btn(C.gold), width: "100%", padding: 14, fontSize: 15, marginBottom: 16 }} onClick={addNote}>
        ✏️ Nouvelle note
      </button>

      {notes.length === 0 && (
        <div style={S.empty}>✏️<br />Aucune note pour l'instant<br />Appuyez sur le bouton ci-dessus</div>
      )}

      {notes.map(note => (
        <div key={note.id} style={S.card}>
          <div style={S.cardPad}>
            <textarea
              autoFocus
              style={{ ...S.textarea, minHeight: 90, marginBottom: 10 }}
              placeholder="Écrivez votre idée ici…"
              value={note.text}
              onChange={e => updateNote(note.id, e.target.value)}
            />
            <div style={S.spaceBetween}>
              <span style={{ fontSize: 11, color: C.muted }}>{fmtDate(note.date)} · {fmtTime(note.date)}</span>
              <button style={S.btnOutline(C.red)} onClick={() => delNote(note.id)}>Supprimer</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════
// ── APP ROOT ──
// ══════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("voice");
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2800);
  }, []);

  const tabs = [
    { id: "voice", label: "VOIX", icon: "🎙" },
    { id: "photos", label: "PHOTOS", icon: "📷" },
    { id: "notes", label: "NOTES", icon: "✏️" },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes ripple { 0%,100% { box-shadow: 0 0 0 0 rgba(224,80,48,0.5); } 50% { box-shadow: 0 0 0 20px rgba(224,80,48,0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #3a3428; border-radius: 2px; }
        textarea::placeholder, input::placeholder { color: #5a5040 !important; }
      `}</style>

      <div style={S.app}>
        {/* HEADER */}
        <div style={S.header}>
          <div style={S.spaceBetween}>
            <div>
              <h1 style={S.h1}>📓 Mon Journal</h1>
              <p style={S.subtitle}>{fmtDate()} · {fmtTime()}</p>
            </div>
            <div style={{ fontSize: 11, color: C.muted, textAlign: "right", lineHeight: 1.6 }}>
              Idées<br />Mémoires
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={S.tabs}>
          {tabs.map(t => (
            <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>
              <span style={{ display: "block", fontSize: 20, marginBottom: 2 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={S.content}>
          {tab === "voice" && <VoiceTab showToast={showToast} />}
          {tab === "photos" && <PhotosTab showToast={showToast} />}
          {tab === "notes" && <NotesTab showToast={showToast} />}
        </div>
      </div>

      <Toast msg={toastMsg} />
    </>
  );
}
