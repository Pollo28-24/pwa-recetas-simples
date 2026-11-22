import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-panel py-8 text-[13px] text-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/icon-72x72.png"
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-full border border-line bg-surface object-contain"
          />
          <p>
            Recetario PWA · Datos e imágenes proporcionados por{" "}
            <a
              href="https://www.themealdb.com/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-text underline hover:text-accent"
            >
              TheMealDB
            </a>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <a
            href="https://www.themealdb.com/documentation"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-text underline hover:text-accent"
          >
            Documentación API
          </a>
          <a
            href="https://www.themealdb.com/terms_of_use.php"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-text underline hover:text-accent"
          >
            Términos de uso
          </a>
        </div>
      </div>
    </footer>
  );
}
