import '@/assets/css/Section.css';

export default function Section({ id, title, action, children }) {
  return (
    <section className="section" aria-labelledby={id}>
      <div className="section__head">
        <h2 className="section__title" id={id}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
