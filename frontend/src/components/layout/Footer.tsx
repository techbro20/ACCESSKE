import { colors } from '../../theme/colors';

export default function Footer() {
  return (
    <footer className="bg-acces-black text-acces-beige py-8 px-4 mt-10 text-center">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 items-center">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <img
            src="/accs logo.PNG"
            alt="ACCES Kenya Logo"
            className="h-12 w-auto object-contain"
          />
          <div>
            <p className="my-1 text-sm font-semibold">
              ACCES Kenya Alumni © 2025
            </p>
            <p className="my-1 text-xs text-gray-400 italic">
              Alleviating poverty through education
            </p>
          </div>
        </div>
        <div
          className="w-full h-px my-2.5"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.red} 50%, transparent 100%)`
          }}
        />
        <a
          href="https://acceskenya.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-acces-beige no-underline text-sm font-medium transition-colors duration-300 inline-flex items-center gap-2 hover:text-acces-red"
        >
          <span>Visit</span>
          <span className="font-bold text-acces-blue">ACCESKENYA.ORG</span>
          <span>→</span>
        </a>
      </div>
    </footer>
  );
}
