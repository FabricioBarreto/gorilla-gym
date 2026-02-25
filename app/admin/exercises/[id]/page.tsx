import { getSession } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { ExerciseDetail } from "@/components/admin/ExerciseDetail";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!exercise) notFound();

  // Adaptar al formato que espera ExerciseDetail (snake_case)
  const exerciseForComponent = {
    ...exercise,
    muscle_group: exercise.muscleGroup,
    image_url: exercise.imageUrl ?? undefined,
    video_url: exercise.videoUrl ?? undefined,
    description: exercise.description ?? undefined,
    instructions: exercise.instructions ?? undefined,
    created_at: exercise.createdAt.toISOString(),
    updated_at: exercise.updatedAt.toISOString(),
    exercise_images: exercise.images.map((img) => ({
      ...img,
      image_url: img.imageUrl,
      exercise_id: img.exerciseId,
      order_index: img.orderIndex,
      created_at: img.createdAt.toISOString(),
    })),
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav userName={session.name} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/exercises"
            className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center"
          >
            ← Volver a ejercicios
          </Link>
        </div>
        <ExerciseDetail exercise={exerciseForComponent} />
      </main>
    </div>
  );
}
