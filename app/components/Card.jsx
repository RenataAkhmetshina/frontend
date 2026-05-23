import { useRouter } from "next/navigation";

export default function Card({ category }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/category/${category.id}`)}
      className="p-6 rounded-xl cursor-pointer
      bg-gradient-to-br from-pink-200 to-blue-200
      hover:scale-105 transition"
    >
      {category.name}
    </div>
  );
}