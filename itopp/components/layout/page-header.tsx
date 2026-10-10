export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="text-xs font-extrabold tracking-widest text-[#0C6B3C]">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0B2E1F] sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1 max-w-xl text-sm text-[#475569]">{description}</p>
      )}
    </div>
  );
}
