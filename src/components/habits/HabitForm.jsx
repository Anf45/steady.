import { useEffect, useState } from "react";

const defaultValues = {
  title: "",
  description: "",
  section: "",
  frequencyType: "daily",
  frequencyTarget: 1,
  difficulty: "easy",
};

export function HabitForm({
  initialValues = defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const [formValues, setFormValues] = useState(defaultValues);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setFormValues({
      title: initialValues.title ?? "",
      description: initialValues.description ?? "",
      section: initialValues.section ?? "",
      frequencyType: initialValues.frequencyType ?? "daily",
      frequencyTarget: initialValues.frequencyTarget ?? 1,
      difficulty: initialValues.difficulty ?? "easy",
    });
    setFormError("");
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: name === "frequencyTarget" ? value : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!formValues.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    await onSubmit({
      ...formValues,
      frequencyTarget: Number(formValues.frequencyTarget),
    });
  }

  const isEditing = Boolean(initialValues.id);

  return (
    <form className="card form-stack habit-form-card" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">{isEditing ? "Edit habit" : "New habit"}</p>
        <h3>{isEditing ? "Update habit" : "Create habit"}</h3>
      </div>

      <label className="field">
        <span>Title</span>
        <input
          type="text"
          name="title"
          value={formValues.title}
          onChange={handleChange}
          placeholder="Drink more water"
        />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          name="description"
          value={formValues.description}
          onChange={handleChange}
          placeholder="Optional note about this habit"
          rows="3"
        />
      </label>

      <label className="field">
        <span>Section</span>
        <input
          type="text"
          name="section"
          value={formValues.section}
          onChange={handleChange}
          placeholder="Morning"
        />
      </label>

      <div className="grid two-column">
        <label className="field">
          <span>Frequency type</span>
          <select name="frequencyType" value={formValues.frequencyType} onChange={handleChange}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>

        <label className="field">
          <span>Target</span>
          <input
            type="number"
            name="frequencyTarget"
            min="1"
            value={formValues.frequencyTarget}
            onChange={handleChange}
          />
        </label>
      </div>

      <label className="field">
        <span>Difficulty</span>
        <select name="difficulty" value={formValues.difficulty} onChange={handleChange}>
          <option value="easy">Easy - 10 XP per check-in</option>
          <option value="medium">Medium - 20 XP per check-in</option>
          <option value="hard">Hard - 30 XP per check-in</option>
        </select>
      </label>

      {formError ? <p className="form-error">{formError}</p> : null}

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Add habit"}
        </button>
      </div>
    </form>
  );
}
