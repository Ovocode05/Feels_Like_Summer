import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
        <p className="mb-8 text-black/60">
          You are not authenticated to view this page.
        </p>
        <Link href="/login">
          <button className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-black/80 transition">
            Login
          </button>
        </Link>
      </div>
    </div>
  );
}
