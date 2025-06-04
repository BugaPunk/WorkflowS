#!/usr/bin/env -S deno run --unstable-kv -A

// Script para obtener el ID del sprint activo
async function main() {
  try {
    const kv = await Deno.openKv();
    
    console.log("🔍 Buscando sprint activo...");
    
    const sprints = [];
    for await (const entry of kv.list({ prefix: ["sprints"] })) {
      sprints.push(entry.value);
    }
    
    console.log(`📋 Total sprints encontrados: ${sprints.length}`);
    
    const activeSprint = sprints.find(s => s.status === "active");
    
    if (activeSprint) {
      console.log(`✅ Sprint activo encontrado:`);
      console.log(`   ID: ${activeSprint.id}`);
      console.log(`   Nombre: ${activeSprint.name || 'Sin nombre'}`);
      console.log(`   Estado: ${activeSprint.status}`);
      console.log(`   Fechas: ${new Date(activeSprint.startDate).toLocaleDateString()} - ${new Date(activeSprint.endDate).toLocaleDateString()}`);
      
      // Imprimir solo el ID para usar en otros scripts
      console.log(`\n🎯 ID del sprint activo: ${activeSprint.id}`);
    } else {
      console.log("❌ No hay sprint activo");
      console.log("💡 Estados de sprints encontrados:");
      sprints.forEach(sprint => {
        console.log(`   - ${sprint.name || sprint.id}: ${sprint.status}`);
      });
    }
    
    kv.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
