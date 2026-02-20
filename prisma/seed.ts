import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const envFile = readFileSync(".env", "utf-8");
    envFile.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts
          .join("=")
          .trim()
          .replace(/^["']|["']$/g, "");
        if (key && value) {
          process.env[key.trim()] = value;
        }
      }
    });
  } catch (error) {
    console.error("❌ No se pudo leer el archivo .env");
    process.exit(1);
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("\n❌ Error: Faltan variables de entorno");
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl.trim().replace(/\s+/g, ""),
  supabaseServiceKey.trim().replace(/\s+/g, ""),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function seed() {
  console.log("\n🌱 Iniciando seed de Gorilla GYM...\n");

  try {
    // 1. Verificar admin
    console.log("👤 Verificando administrador...");
    const adminDNI = "11111111";

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("dni", adminDNI)
      .single();

    let adminId = existingProfile?.id;

    if (!adminId) {
      // Crear admin si no existe
      const { data: adminUser, error: adminError } =
        await supabase.auth.admin.createUser({
          email: `${adminDNI}@Gorillagym.local`,
          password: "admin123456",
          email_confirm: true,
          user_metadata: { full_name: "Administrador Principal" },
        });

      if (adminError) {
        console.error("❌ Error creando admin:", adminError);
        return;
      }

      adminId = adminUser.user.id;

      await supabase
        .from("profiles")
        .update({
          role: "admin",
          dni: adminDNI,
          full_name: "Administrador Principal",
        })
        .eq("id", adminId);

      console.log("✅ Admin creado");
    } else {
      console.log("✅ Admin encontrado");
    }

    // 2. Crear miembros
    console.log("\n👥 Creando miembros...");
    const members = [
      { dni: "12345678", full_name: "Juan Pérez", phone: "+54 9 362 4123456" },
      {
        dni: "23456789",
        full_name: "María García",
        phone: "+54 9 362 4234567",
      },
      {
        dni: "34567890",
        full_name: "Carlos López",
        phone: "+54 9 362 4345678",
      },
      {
        dni: "45678901",
        full_name: "Ana Martínez",
        phone: "+54 9 362 4456789",
      },
      {
        dni: "56789012",
        full_name: "Pedro Rodríguez",
        phone: "+54 9 362 4567890",
      },
    ];

    const createdMembers = [];

    for (const member of members) {
      const { data: memberUser, error } = await supabase.auth.admin.createUser({
        email: `${member.dni}@Gorillagym.local`,
        password: "password123",
        email_confirm: true,
        user_metadata: { full_name: member.full_name },
      });

      if (error) {
        console.error(`❌ Error creando ${member.dni}:`, error.message);
        continue;
      }

      await supabase
        .from("profiles")
        .update({
          role: "member",
          dni: member.dni,
          phone: member.phone,
          full_name: member.full_name,
        })
        .eq("id", memberUser.user.id);

      createdMembers.push(memberUser.user);
      console.log(`✅ ${member.full_name} - DNI: ${member.dni}`);
    }

    // 3. Membresías
    console.log("\n💳 Creando membresías...");
    const today = new Date();
    const plans = ["mensual", "trimestral", "anual", "mensual", "trimestral"];
    const statuses = ["active", "active", "active", "expired", "active"];

    for (let i = 0; i < createdMembers.length; i++) {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 15);

      let endDate = new Date(startDate);
      const planType = plans[i];

      if (planType === "mensual") endDate.setMonth(endDate.getMonth() + 1);
      else if (planType === "trimestral")
        endDate.setMonth(endDate.getMonth() + 3);
      else endDate.setFullYear(endDate.getFullYear() + 1);

      await supabase.from("memberships").insert({
        user_id: createdMembers[i].id,
        plan_type: planType,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        status: statuses[i],
      });

      console.log(`✅ ${planType} - ${statuses[i]}`);
    }

    // 4. Pagos
    console.log("\n💰 Creando pagos...");
    const amounts = { mensual: 15000, trimestral: 40000, anual: 150000 };

    for (let i = 0; i < createdMembers.length; i++) {
      const { data: membership } = await supabase
        .from("memberships")
        .select("*")
        .eq("user_id", createdMembers[i].id)
        .single();

      if (membership) {
        await supabase.from("payments").insert({
          user_id: createdMembers[i].id,
          amount: amounts[membership.plan_type as keyof typeof amounts],
          payment_date: membership.start_date,
          period_start: membership.start_date,
          period_end: membership.end_date,
          status: membership.status === "active" ? "paid" : "overdue",
          notes: membership.plan_type,
        });
      }
    }

    // 5. Ejercicios
    console.log("\n🏋️ Creando ejercicios...");
    const exercises = [
      {
        name: "Press de Banca",
        muscle_group: "Pecho",
        description: "Ejercicio fundamental para pecho",
      },
      {
        name: "Sentadilla",
        muscle_group: "Piernas",
        description: "Rey de los ejercicios de pierna",
      },
      {
        name: "Peso Muerto",
        muscle_group: "Espalda",
        description: "Ejercicio compuesto para espalda y piernas",
      },
      {
        name: "Press Militar",
        muscle_group: "Hombros",
        description: "Desarrollo de hombros",
      },
      {
        name: "Dominadas",
        muscle_group: "Espalda",
        description: "Ejercicio de tracción para espalda",
      },
      {
        name: "Curl de Bíceps",
        muscle_group: "Brazos",
        description: "Aislamiento de bíceps",
      },
      {
        name: "Extensión de Tríceps",
        muscle_group: "Brazos",
        description: "Aislamiento de tríceps",
      },
      {
        name: "Plancha",
        muscle_group: "Abdomen",
        description: "Ejercicio isométrico de core",
      },
      {
        name: "Remo con Barra",
        muscle_group: "Espalda",
        description: "Desarrollo de espalda media",
      },
      {
        name: "Elevaciones Laterales",
        muscle_group: "Hombros",
        description: "Desarrollo de hombros laterales",
      },
    ];

    const createdExercises = [];

    for (const exercise of exercises) {
      const { data, error } = await supabase
        .from("exercises")
        .insert(exercise)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creando ${exercise.name}:`, error.message);
        continue;
      }

      createdExercises.push(data);
      console.log(`✅ ${exercise.name}`);
    }

    // 6. Rutinas
    console.log("\n📋 Creando rutinas...");

    // Rutina 1: Full Body
    const { data: routine1, error: routine1Error } = await supabase
      .from("routines")
      .insert({ name: "Rutina Full Body - Principiante", created_by: adminId })
      .select()
      .single();

    if (routine1Error) {
      console.error("❌ Error creando Rutina Full Body:", routine1Error);
    } else {
      const { error: exercises1Error } = await supabase
        .from("routine_exercises")
        .insert([
          {
            routine_id: routine1.id,
            exercise_id: createdExercises[1].id,
            sets: 3,
            reps: "12",
            rest_seconds: 90,
            order_index: 1,
          },
          {
            routine_id: routine1.id,
            exercise_id: createdExercises[0].id,
            sets: 3,
            reps: "10",
            rest_seconds: 90,
            order_index: 2,
          },
          {
            routine_id: routine1.id,
            exercise_id: createdExercises[8].id,
            sets: 3,
            reps: "12",
            rest_seconds: 60,
            order_index: 3,
          },
          {
            routine_id: routine1.id,
            exercise_id: createdExercises[3].id,
            sets: 3,
            reps: "10",
            rest_seconds: 90,
            order_index: 4,
          },
          {
            routine_id: routine1.id,
            exercise_id: createdExercises[7].id,
            sets: 3,
            reps: "30 seg",
            rest_seconds: 60,
            order_index: 5,
          },
        ]);

      if (exercises1Error) {
        console.error(
          "❌ Error agregando ejercicios a Full Body:",
          exercises1Error,
        );
      } else {
        console.log("✅ Rutina Full Body");

        // Asignar a Juan y Carlos
        if (createdMembers.length >= 3) {
          await supabase.from("routine_assignments").insert([
            {
              routine_id: routine1.id,
              user_id: createdMembers[0].id,
              assigned_by: adminId,
            },
            {
              routine_id: routine1.id,
              user_id: createdMembers[2].id,
              assigned_by: adminId,
            },
          ]);
          console.log("✅ Full Body → Juan y Carlos");
        }
      }
    }

    // Rutina 2: Push
    const { data: routine2, error: routine2Error } = await supabase
      .from("routines")
      .insert({ name: "Rutina Push - Empuje", created_by: adminId })
      .select()
      .single();

    if (routine2Error) {
      console.error("❌ Error creando Rutina Push:", routine2Error);
    } else {
      const { error: exercises2Error } = await supabase
        .from("routine_exercises")
        .insert([
          {
            routine_id: routine2.id,
            exercise_id: createdExercises[0].id,
            sets: 4,
            reps: "8-10",
            rest_seconds: 120,
            order_index: 1,
          },
          {
            routine_id: routine2.id,
            exercise_id: createdExercises[3].id,
            sets: 4,
            reps: "8-10",
            rest_seconds: 120,
            order_index: 2,
          },
          {
            routine_id: routine2.id,
            exercise_id: createdExercises[9].id,
            sets: 3,
            reps: "12",
            rest_seconds: 60,
            order_index: 3,
          },
          {
            routine_id: routine2.id,
            exercise_id: createdExercises[6].id,
            sets: 3,
            reps: "12",
            rest_seconds: 60,
            order_index: 4,
          },
        ]);

      if (exercises2Error) {
        console.error("❌ Error agregando ejercicios a Push:", exercises2Error);
      } else {
        console.log("✅ Rutina Push");

        // Asignar a María y Ana
        if (createdMembers.length >= 4) {
          await supabase.from("routine_assignments").insert([
            {
              routine_id: routine2.id,
              user_id: createdMembers[1].id,
              assigned_by: adminId,
            },
            {
              routine_id: routine2.id,
              user_id: createdMembers[3].id,
              assigned_by: adminId,
            },
          ]);
          console.log("✅ Push → María y Ana");
        }
      }
    }

    console.log("\n✅ Seed completado!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("CREDENCIALES:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("ADMIN - DNI: 11111111 / Pass: admin123456");
    console.log("\nMIEMBROS - Pass: password123");
    members.forEach((m) => console.log(`  DNI: ${m.dni} - ${m.full_name}`));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

seed();
