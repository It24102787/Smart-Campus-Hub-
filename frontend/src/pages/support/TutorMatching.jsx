import { useEffect, useMemo, useState } from "react";
import TutorCard from "../../components/support/TutorCard";
import SelectField from "../../components/support/SelectField";
import { SUBJECTS, DAYS } from "../../utils/constants";
import { tutorApi } from "../../api/supportApi";
import {
  initialTutorForm,
  normalizeTutorList,
  sanitizeRating,
  validateTutorForm,
} from "./tutorMatching.helpers";

export default function TutorMatching() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("");
  const [mode, setMode] = useState("");
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(initialTutorForm);
  const [formErr, setFormErr] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  const loadTutors = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await tutorApi.getAll();
      setTutors(normalizeTutorList(data));
    } catch (e) {
      console.error(e);
      setTutors([]);
      setErr("Failed to load tutors. Check backend (8080) + MongoDB running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutors();
  }, []);

  const filtered = useMemo(() => {
    return (Array.isArray(tutors) ? tutors : []).filter((t) => {
      const okSubject = subject ? t.subject === subject : true;
      const okDay = day ? t.availableDay === day : true;
      const okMode = mode ? t.mode === mode : true;
      const okSearch = search
        ? `${t.name || ""} ${t.subject || ""}`.toLowerCase().includes(search.toLowerCase())
        : true;
      return okSubject && okDay && okMode && okSearch;
    });
  }, [tutors, subject, day, mode, search]);

  const clearFilters = () => {
    setSubject("");
    setDay("");
    setMode("");
    setSearch("");
  };

  const openAddModal = () => {
    setForm(initialTutorForm);
    setFormErr({});
    setTouched({});
    setShowAdd(true);
  };

  const closeAddModal = () => {
    if (saving) return;
    setShowAdd(false);
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    const v = name === "rating" ? sanitizeRating(value) : value;

    setForm((prev) => {
      const next = { ...prev, [name]: v };

      const allErr = validateTutorForm(next);
      const filteredErr = {};
      Object.keys(allErr).forEach((k) => touched[k] && (filteredErr[k] = allErr[k]));
      setFormErr(filteredErr);

      return next;
    });
  };

  const onBlurField = (e) => {
    const { name } = e.target;
    setTouched((prev) => {
      const nextTouched = { ...prev, [name]: true };
      const allErr = validateTutorForm(form);

      const filteredErr = {};
      Object.keys(allErr).forEach((k) => nextTouched[k] && (filteredErr[k] = allErr[k]));
      setFormErr(filteredErr);

      return nextTouched;
    });
  };

  const validateAddTutor = () => {
    const allTouched = {
      name: true,
      subject: true,
      availableDay: true,
      mode: true,
      timeFrom: true,
      timeTo: true,
      rating: true,
    };
    setTouched(allTouched);

    const e = validateTutorForm(form);
    setFormErr(e);
    return Object.keys(e).length === 0;
  };

  const submitAddTutor = async (ev) => {
    ev.preventDefault();
    if (!validateAddTutor()) return;

    try {
      setSaving(true);
      setErr("");

      const payload = {
        name: form.name.trim(),
        subject: form.subject,
        availableDay: form.availableDay,
        mode: form.mode,
        timeFrom: form.timeFrom,
        timeTo: form.timeTo,
        rating: Number(form.rating),
      };

      await tutorApi.create(payload);
      setShowAdd(false);
      await loadTutors();
    } catch (e) {
      console.error(e);
      setErr("Failed to add tutor. Check backend (POST /api/tutors) & CORS.");
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = useMemo(() => Object.keys(validateTutorForm(form)).length === 0, [form]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">Tutor Matching</h2>
          <div className="page-sub">Find tutors by subject, day, and mode</div>
        </div>

        <button className="btn" onClick={openAddModal}>
          + Join Tutor
        </button>
      </div>

      {/* Filters */}
      <div className="panel">
        <div className="filters">
          <div className="field">
            <label className="label">Search</label>
            <input
              className="input"
              placeholder="Type tutor name or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <SelectField
            label="Subject"
            name="subjectFilter"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="All"
            options={SUBJECTS.map((s) => ({ label: s, value: s }))}
          />

          <SelectField
            label="Day"
            name="dayFilter"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="All"
            options={DAYS.map((d) => ({ label: d, value: d }))}
          />

          <SelectField
            label="Mode"
            name="modeFilter"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            placeholder="All"
            options={[
              { label: "Online", value: "Online" },
              { label: "On-Campus", value: "On-Campus" },
            ]}
          />

          <div className="field field-actions">
            <button className="btn-outline" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Refresh */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <button className="btn-outline" onClick={loadTutors}>
          Refresh
        </button>
      </div>

      {loading && <div className="empty">Loading tutors...</div>}
      {err && <div className="empty" style={{ color: "#ef4444" }}>{err}</div>}

      {!loading && !err && (
        <>
          <div className="grid-2">
            {filtered.map((t) => (
              <TutorCard key={t.id || t._id} tutor={t} />
            ))}
          </div>
          {filtered.length === 0 && <div className="empty">No tutors found for selected filters.</div>}
        </>
      )}

      {/* Add Tutor Modal */}
      {showAdd && (
        <div className="modal-backdrop" onClick={closeAddModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">➕ Add Tutor</div>
            <div className="modal-text">Fill details to create a tutor card.</div>

            <form onSubmit={submitAddTutor} style={{ marginTop: 14 }}>
              <div className="form-grid">
                <div className="field">
                  <label className="label">Tutor Name *</label>
                  <input
                    className={`input ${formErr.name ? "input-error" : ""}`}
                    name="name"
                    value={form.name}
                    onChange={onFormChange}
                    onBlur={onBlurField}
                    placeholder="e.g. John Silva"
                  />
                  {formErr.name && <div className="error-text">{formErr.name}</div>}
                </div>

                <SelectField
                  label="Subject *"
                  name="subject"
                  value={form.subject}
                  onChange={onFormChange}
                  onBlur={onBlurField}
                  error={formErr.subject}
                  options={SUBJECTS.map((s) => ({ label: s, value: s }))}
                />

                <SelectField
                  label="Available Day *"
                  name="availableDay"
                  value={form.availableDay}
                  onChange={onFormChange}
                  onBlur={onBlurField}
                  error={formErr.availableDay}
                  options={DAYS.map((d) => ({ label: d, value: d }))}
                />

                <SelectField
                  label="Mode"
                  name="mode"
                  value={form.mode}
                  onChange={onFormChange}
                  onBlur={onBlurField}
                  error={formErr.mode}
                  includePlaceholder={false}
                  options={[
                    { label: "Online", value: "Online" },
                    { label: "On-Campus", value: "On-Campus" },
                  ]}
                />

                <div className="field">
                  <label className="label">Start Time *</label>
                  <input
                    className={`input ${formErr.timeFrom ? "input-error" : ""}`}
                    type="time"
                    name="timeFrom"
                    value={form.timeFrom}
                    onChange={onFormChange}
                    onBlur={onBlurField}
                  />
                  {formErr.timeFrom && <div className="error-text">{formErr.timeFrom}</div>}
                </div>

                <div className="field">
                  <label className="label">End Time *</label>
                  <input
                    className={`input ${formErr.timeTo ? "input-error" : ""}`}
                    type="time"
                    name="timeTo"
                    value={form.timeTo}
                    onChange={onFormChange}
                    onBlur={onBlurField}
                  />
                  {formErr.timeTo && <div className="error-text">{formErr.timeTo}</div>}
                </div>

                <div className="field">
                  <label className="label">Rating (0 - 5) *</label>
                  <input
                    className={`input ${formErr.rating ? "input-error" : ""}`}
                    name="rating"
                    value={form.rating}
                    onChange={onFormChange}
                    onBlur={onBlurField}
                    placeholder="4.5"
                    inputMode="decimal"
                  />
                  {formErr.rating && <div className="error-text">{formErr.rating}</div>}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={closeAddModal} disabled={saving}>
                  Cancel
                </button>
                <button className="btn" type="submit" disabled={saving || !isFormValid}>
                  {saving ? "Adding..." : "Add Tutor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}