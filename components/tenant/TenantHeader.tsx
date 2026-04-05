"use client";

interface TenantHeaderProps {
  tenantName: string;
  propertyName: string;
}

export default function TenantHeader({ tenantName, propertyName }: TenantHeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="font-serif text-2xl font-normal tracking-tight text-ink">
          Hello, {tenantName.split(" ")[0]}
        </h1>
        <p className="mt-0.5 text-[0.78rem] text-muted">
          {propertyName}
        </p>
      </div>
    </header>
  );
}
