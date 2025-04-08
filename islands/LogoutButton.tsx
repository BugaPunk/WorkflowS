export default function LogoutButton() {
  return (
    <div class="mt-8 text-center">
      <a
        href="/logout"
        class="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Cerrar Sesión
      </a>
    </div>
  );
}
