interface HeaderSectionProps {
  label?: string;
  title: string;
  subtitle?: string;
}

export function HeaderSection({ label, title, subtitle }: HeaderSectionProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {label ? (
        <div className="portrait-pill mb-4 px-4 py-2 text-sm font-medium">
          {label}
        </div>
      ) : null}
      <h2 className="max-w-3xl text-balance font-heading text-3xl font-medium leading-tight tracking-[-0.035em] text-[#08304c] md:text-4xl lg:text-[42px]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-6 max-w-3xl text-balance text-lg leading-8 text-[#08304c]/60">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
