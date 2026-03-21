export const initialForm = {
    name: "",
    subject: "",
    availableDay: "",
    mode: "Online",
    timeFrom: "",
    timeTo: "",
    rating: "4.5",
};

export const isTime = (v) => typeof v === "string" && /^\d{2}:\d{2}$/.test(v);

export const sanitizeRating = (value) => {
    let v = value;
    v = v.replace(/[^\d.]/g, "");
    const parts = v.split(".");
    if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
    return v;
};

export const validateTutorForm = (f) => {
    const e = {};

    const name = (f.name || "").trim();
    if (!name) e.name = "Tutor name is required";
    else if (name.length < 3) e.name = "Name must be at least 3 characters";
    else if (name.length > 60) e.name = "Name must be less than 60 characters";

    if (!f.subject) e.subject = "Subject is required";
    if (!f.availableDay) e.availableDay = "Available day is required";

    const allowedModes = ["Online", "On-Campus"];
    if (!allowedModes.includes(f.mode)) e.mode = "Invalid mode";

    if (!f.timeFrom) e.timeFrom = "Start time is required";
    else if (!isTime(f.timeFrom)) e.timeFrom = "Invalid start time";

    if (!f.timeTo) e.timeTo = "End time is required";
    else if (!isTime(f.timeTo)) e.timeTo = "Invalid end time";

    if (f.timeFrom && f.timeTo && isTime(f.timeFrom) && isTime(f.timeTo)) {
        if (f.timeFrom >= f.timeTo) e.timeTo = "End time must be after start time";
    }

    const ratingStr = String(f.rating ?? "").trim();
    if (ratingStr === "") {
        e.rating = "Rating is required";
    } else {
        const r = Number(ratingStr);
        if (!Number.isFinite(r)) e.rating = "Rating must be a number";
        else if (r < 0 || r > 5) e.rating = "Rating must be between 0 and 5";
    }

    return e;
};

export const normalizeTutorList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
};
