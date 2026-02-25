"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function NewExerciseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    muscle_group: "Pecho",
    description: "",
    instructions: "",
  });

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

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.length > 5) {
      setError("Máximo 5 imágenes por ejercicio");
      return;
    }
    setImageFiles(files);
    const previews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) setImagePreviews(previews);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Convierte File a base64 para enviar a la API de upload
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const base64Images = await Promise.all(files.map(fileToBase64));
    const res = await fetch("/api/upload/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: base64Images, bucket: "exercise-images" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al subir imágenes");
    return data.urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (imageFiles.length === 0)
        throw new Error("Debes subir al menos una imagen del ejercicio");

      // 1. Subir imágenes
      const imageUrls = await uploadImages(imageFiles);

      // 2. Crear ejercicio con URLs
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image_urls: imageUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push("/admin/exercises");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al crear el ejercicio");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 border border-gray-700 rounded-lg p-6"
    >
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            📋 Información Básica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Ejercicio *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Press de Banca"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Grupo Muscular *
              </label>
              <select
                required
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ejercicio fundamental para desarrollo de pecho"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            🖼️ Imágenes del Ejercicio *
          </h2>
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
                JPG, PNG o GIF. Sube varias imágenes para mostrar la ejecución
                paso a paso.
              </p>
            </div>
            {imagePreviews.length > 0 && (
              <div>
                <p className="text-sm text-gray-300 mb-3">
                  {imagePreviews.length} imagen
                  {imagePreviews.length !== 1 ? "es" : ""} seleccionada
                  {imagePreviews.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-48 bg-gray-700 rounded-lg overflow-hidden">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        Paso {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            📝 Instrucciones
          </h2>
          <textarea
            value={formData.instructions}
            onChange={(e) =>
              setFormData({ ...formData, instructions: e.target.value })
            }
            rows={8}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={
              "1. Acostarse en el banco con los pies firmes en el suelo\n2. Agarrar la barra con las manos al ancho de los hombros\n3. Bajar controladamente hasta el pecho\n4. Empujar hacia arriba hasta extender los brazos completamente"
            }
          />
          <p className="text-gray-400 text-xs mt-1">
            Escribe las instrucciones paso a paso. Usa saltos de línea para cada
            paso.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || imageFiles.length === 0}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Crear Ejercicio"}
          </button>
        </div>
      </div>
    </form>
  );
}
