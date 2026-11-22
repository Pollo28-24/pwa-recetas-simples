export function Footer() {
  return (
    <footer className="mt-16 border-t border-line py-8 text-xs text-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          Recetario PWA · Datos e imágenes culinarias de{" "}
          <a
            href="https://www.themealdb.com/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline underline-offset-4 hover:text-text"
          >
            TheMealDB
          </a>
          .
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href="https://www.themealdb.com/documentation"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-text"
          >
            Documentación API
          </a>
          <a
            href="https://www.themealdb.com/terms_of_use.php"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-text"
          >
            Términos de uso
          </a>
        </div>
      </div>
    </footer>
  );
}
