export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-10 text-[11px] uppercase tracking-[0.35em]">
        <p>© {new Date().getFullYear()} Collecify Studio</p>
        <p>Prototype Interface</p>
      </div>
    </footer>
  );
}
