"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ExerciseImage {
  id: string;
  image_url: string;
  order_index: number;
}
interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  description?: string;
  instructions?: string;
  created_at: string;
  exercise_images?: ExerciseImage[];
}

export function ExerciseDetail({ exercise }: { exercise: Exercise }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [formData, setFormData] = useState({
    name: exercise.name,
    muscle_group: exercise.muscle_group,
    description: exercise.description || "",
    instructions: exercise.instructions || "",
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [tempImageOrder, setTempImageOrder] = useState<ExerciseImage[]>([]);

  const muscleGroups = [
    "Pecho",
    "Espalda",
    "Hombros",
    "Bíceps",
    "Tríceps",
    "Brazos",
    "Cuádriceps",
    "Isquiotibiales",
    "Glúteos",
    "Abdomen",
    "Piernas",
    "Pantorrillas",
    "Core",
  ];
  const sortedImages =
    exercise.exercise_images?.sort((a, b) => a.order_index - b.order_index) ||
    [];

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.length > 5) {
      setError("Máximo 5 imágenes a la vez");
      return;
    }
    setNewImages(files);
    const previews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) setNewImagePreviews(previews);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImages = async () => {
    if (newImages.length === 0) return;
    setUploadingImages(true);
    setError(null);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

      // Subir directo a Cloudinary desde el browser (sin pasar por tu servidor)
      const uploadPromises = newImages.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", "exercise-images");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData },
        );
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return data.secure_url as string;
      });

      const urls = await Promise.all(uploadPromises);

      // Solo mandar las URLs a tu API (payload mínimo)
      const res = await fetch(`/api/exercises/${exercise.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_urls: urls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNewImages([]);
      setNewImagePreviews([]);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al agregar imágenes");
    } finally {
      setUploadingImages(false);
    }
  };

  const startReordering = () => {
    setReorderMode(true);
    setTempImageOrder([...sortedImages]);
  };

  const moveImage = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= tempImageOrder.length) return;
    const newOrder = [...tempImageOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setTempImageOrder(newOrder);
  };

  const saveNewOrder = async () => {
    setReordering(true);
    setError(null);
    try {
      const res = await fetch(`/api/exercises/${exercise.id}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: tempImageOrder.map((img, index) => ({
            id: img.id,
            orderIndex: index,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReorderMode(false);
      router.refresh();
    } catch (err: any) {
      setError("Error al guardar el orden: " + err.message);
    } finally {
      setReordering(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/exercises/${exercise.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;
    try {
      const res = await fetch(
        `/api/exercises/${exercise.id}/images/${imageId}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (currentImageIndex >= sortedImages.length - 1 && currentImageIndex > 0)
        setCurrentImageIndex(0);
      router.refresh();
    } catch (err: any) {
      alert("Error al eliminar la imagen: " + err.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      description: exercise.description || "",
      instructions: exercise.instructions || "",
    });
    setIsEditing(false);
    setError(null);
  };

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length);
  const prevImage = () =>
    setCurrentImageIndex(
      (prev) => (prev - 1 + sortedImages.length) % sortedImages.length,
    );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isEditing ? "Editar Ejercicio" : exercise.name}
            </h1>
            {!isEditing && (
              <p className="text-gray-400">
                {exercise.muscle_group} • Creado el{" "}
                {new Date(exercise.created_at).toLocaleDateString("es-AR")}
              </p>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              ✏️ Editar
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Ejercicio
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grupo Muscular
                </label>
                <select
                  value={formData.muscle_group}
                  onChange={(e) =>
                    setFormData({ ...formData, muscle_group: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {muscleGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción Breve
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instrucciones
                </label>
                <textarea
                  rows={6}
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        ) : (
          exercise.description && (
            <div>
              <p className="text-gray-400 text-sm mb-1">Descripción</p>
              <p className="text-white">{exercise.description}</p>
            </div>
          )
        )}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            🖼️ Imágenes ({sortedImages.length})
          </h2>
          {sortedImages.length > 1 && !reorderMode && (
            <button
              onClick={startReordering}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
            >
              🔄 Reordenar
            </button>
          )}
        </div>

        {reorderMode ? (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <p className="text-purple-300 text-sm">
                ℹ️ Usa las flechas ↑↓ para cambiar el orden de las imágenes
              </p>
            </div>
            <div className="space-y-3">
              {tempImageOrder.map((img, index) => (
                <div
                  key={img.id}
                  className="bg-gray-700/50 rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveImage(index, "down")}
                      disabled={index === tempImageOrder.length - 1}
                      className="text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <Image
                      src={img.image_url}
                      alt={`Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Paso {index + 1}</p>
                    <p className="text-gray-400 text-sm">
                      Orden anterior:{" "}
                      {sortedImages.findIndex((i) => i.id === img.id) + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <button
                onClick={() => setReorderMode(false)}
                disabled={reordering}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveNewOrder}
                disabled={reordering}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
              >
                {reordering ? "Guardando..." : "Guardar Nuevo Orden"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {sortedImages.length > 0 && (
              <div className="mb-6">
                <div className="relative mb-4">
                  <div className="relative w-full h-96 bg-gray-700 rounded-lg overflow-hidden group">
                    <Image
                      src={sortedImages[currentImageIndex].image_url}
                      alt={`${exercise.name} - Imagen ${currentImageIndex + 1}`}
                      fill
                      className="object-contain"
                    />
                    {sortedImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ←
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          →
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} de {sortedImages.length}
                        </div>
                      </>
                    )}
                    <button
                      onClick={() =>
                        handleDeleteImage(sortedImages[currentImageIndex].id)
                      }
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
                {sortedImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {sortedImages.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? "border-green-500 scale-110" : "border-gray-600 hover:border-gray-500"}`}
                      >
                        <Image
                          src={img.image_url}
                          alt={`Miniatura ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs">
                          {idx + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-white font-semibold mb-4">
                ➕ Agregar Nuevas Imágenes
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subir Imágenes (Hasta 5)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    JPG, PNG o GIF. Las imágenes se agregarán al final de la
                    lista.
                  </p>
                </div>
                {newImagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-300 mb-3">
                      {newImagePreviews.length} imagen
                      {newImagePreviews.length !== 1 ? "es" : ""} seleccionada
                      {newImagePreviews.length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      {newImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <div className="relative w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            Nueva {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setNewImages([]);
                          setNewImagePreviews([]);
                        }}
                        disabled={uploadingImages}
                        className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleAddImages}
                        disabled={uploadingImages}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                      >
                        {uploadingImages ? "Subiendo..." : "Agregar Imágenes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {!isEditing && exercise.instructions && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            📝 Instrucciones
          </h2>
          <div className="text-gray-300 whitespace-pre-line">
            {exercise.instructions}
          </div>
        </div>
      )}
    </div>
  );
}
