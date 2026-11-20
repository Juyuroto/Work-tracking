import { useId } from 'react';
import '@/assets/css/Field.css';

// Champ de formulaire : input, textarea (type="textarea") ou select (si `options`).
export default function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required = false,
  options,
  placeholder,
  wide = false,
  ...rest
}) {
  const id = useId();
  const common = { id, name, required, className: 'control field__control', defaultValue: defaultValue == null ? '' : String(defaultValue), ...rest };

  let control;
  if (options) {
    control = (
      <select {...common}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (type === 'textarea') {
    control = <textarea rows={4} {...common} />;
  } else {
    control = <input type={type} placeholder={placeholder} {...common} />;
  }

  return (
    <div className={`field${wide ? ' field--wide' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {control}
    </div>
  );
}
