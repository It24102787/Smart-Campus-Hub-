export default function SelectField({
    label,
    name,
    value,
    onChange,
    options,
    placeholder = "Select",
    includePlaceholder = true,
    onBlur,
    error,
    className = "field",
}) {
    return (
        <div className={className}>
            <label className="label">{label}</label>
            <select
                className={`input ${error ? "input-error" : ""}`}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
            >
                {includePlaceholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <div className="error-text">{error}</div>}
        </div>
    );
}
