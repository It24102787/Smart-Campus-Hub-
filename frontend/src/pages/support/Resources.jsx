import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resourceApi } from "../../api/supportApi";
import { SUBJECTS } from "../../utils/constants";

// Student resource library page for browsing and downloading study materials.
export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subjectFilter, setSubjectFilter] = useState("");

    // Pull resources from backend, optionally narrowed by subject.
    const loadResources = async () => {
        setLoading(true);
        try {
            const data = await resourceApi.getAll(subjectFilter);
            setResources(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResources();
    }, [subjectFilter]);

    // Trigger file download endpoint for the selected resource.
    const handleDownload = (id) => {
        resourceApi.download(id);
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2 className="page-title">Resources Library</h2>
                    <div className="page-sub">Browse and download study materials</div>
                </div>
                <Link className="btn" to="/support/resources/upload">Upload Note</Link>
            </div>

            <div className="panel filters">
                <div className="field">
                    <label className="label">Filter by Subject</label>
                    <select className="input" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
                        <option value="">All Subjects</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="panel">
                    <div className="table">
                        <div className="tr th">
                            <div>Title</div>
                            <div>Subject</div>
                            <div>Uploaded By</div>
                            <div>Actions</div>
                        </div>
                        {resources.map(r => (
                            <div key={r.id} className="tr">
                                <div>{r.title}</div>
                                <div><span className="badge">{r.subject}</span></div>
                                <div>{r.uploadedBy || "Anonymous"}</div>
                                <div>
                                    <button className="btn-outline small" onClick={() => handleDownload(r.id)}>Download</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {resources.length === 0 && <p className="empty">No resources found.</p>}
                </div>
            )}
        </div>
    );
}
