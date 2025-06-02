#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script para crear rúbricas de ejemplo
 * Ejecutar con: deno run --unstable-kv -A scripts/populate-rubrics.ts
 */

import { createRubric } from "../services/rubricService.ts";
import { RubricStatus } from "../models/rubric.ts";

console.log("📋 Creando rúbricas de ejemplo...");

async function createSampleRubrics() {
  try {
    // Rúbrica general para desarrollo de software
    const generalRubric = await createRubric({
      name: "Rúbrica General de Desarrollo de Software",
      description: "Plantilla estándar para evaluar entregables de desarrollo de software",
      createdBy: "admin",
      isTemplate: true,
      status: RubricStatus.ACTIVE,
      criteria: [
        {
          id: crypto.randomUUID(),
          name: "Funcionalidad",
          description: "El software cumple con los requisitos funcionales especificados",
          maxPoints: 25,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Cumple completamente con todos los requisitos",
              pointValue: 25
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Cumple con la mayoría de requisitos",
              pointValue: 20
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Cumple parcialmente con los requisitos",
              pointValue: 15
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: No cumple con los requisitos básicos",
              pointValue: 5
            }
          ]
        },
        {
          id: crypto.randomUUID(),
          name: "Calidad del Código",
          description: "El código es limpio, bien estructurado y documentado",
          maxPoints: 20,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Código muy limpio y bien documentado",
              pointValue: 20
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Código limpio con documentación adecuada",
              pointValue: 16
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Código aceptable con poca documentación",
              pointValue: 12
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Código difícil de leer y sin documentación",
              pointValue: 4
            }
          ]
        },
        {
          id: crypto.randomUUID(),
          name: "Interfaz de Usuario",
          description: "La interfaz es intuitiva, atractiva y fácil de usar",
          maxPoints: 20,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Interfaz muy intuitiva y atractiva",
              pointValue: 20
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Interfaz clara y funcional",
              pointValue: 16
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Interfaz básica pero usable",
              pointValue: 12
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Interfaz confusa o difícil de usar",
              pointValue: 4
            }
          ]
        },
        {
          id: crypto.randomUUID(),
          name: "Pruebas y Validación",
          description: "El software ha sido probado adecuadamente",
          maxPoints: 15,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Pruebas exhaustivas y bien documentadas",
              pointValue: 15
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Pruebas adecuadas de funcionalidades principales",
              pointValue: 12
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Pruebas básicas realizadas",
              pointValue: 9
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Pocas o ninguna prueba realizada",
              pointValue: 3
            }
          ]
        },
        {
          id: crypto.randomUUID(),
          name: "Documentación",
          description: "La documentación del proyecto es completa y clara",
          maxPoints: 20,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Documentación completa y muy clara",
              pointValue: 20
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Documentación adecuada y clara",
              pointValue: 16
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Documentación básica",
              pointValue: 12
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Documentación incompleta o confusa",
              pointValue: 4
            }
          ]
        }
      ]
    });

    console.log("✅ Rúbrica general creada");

    // Rúbrica específica para presentaciones
    const presentationRubric = await createRubric({
      name: "Rúbrica de Presentación de Proyecto",
      description: "Para evaluar presentaciones orales de proyectos",
      createdBy: "admin",
      isTemplate: true,
      status: RubricStatus.ACTIVE,
      criteria: [
        {
          id: crypto.randomUUID(),
          name: "Contenido",
          description: "La presentación cubre todos los aspectos importantes del proyecto",
          maxPoints: 30,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Contenido completo y bien estructurado",
              pointValue: 30
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Contenido adecuado con buena estructura",
              pointValue: 24
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Contenido básico, estructura aceptable",
              pointValue: 18
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Contenido incompleto o mal estructurado",
              pointValue: 6
            }
          ]
        },
        {
          id: crypto.randomUUID(),
          name: "Claridad de Comunicación",
          description: "Los presentadores se expresan de manera clara y comprensible",
          maxPoints: 25,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Comunicación muy clara y fluida",
              pointValue: 25
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Comunicación clara y comprensible",
              pointValue: 20
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Comunicación aceptable",
              pointValue: 15
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Comunicación confusa o difícil de seguir",
              pointValue: 5
            }
          ]
        },
        {
          id: crypto.randomUUID(),
          name: "Uso del Tiempo",
          description: "La presentación respeta el tiempo asignado",
          maxPoints: 15,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Uso perfecto del tiempo asignado",
              pointValue: 15
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Uso adecuado del tiempo",
              pointValue: 12
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Ligeras desviaciones del tiempo",
              pointValue: 9
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Mal uso del tiempo (muy corto o muy largo)",
              pointValue: 3
            }
          ]
        },
        {
          id: crypto.randomUUID(),
          name: "Manejo de Preguntas",
          description: "Los presentadores responden adecuadamente a las preguntas",
          maxPoints: 20,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Respuestas completas y precisas",
              pointValue: 20
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Respuestas adecuadas y claras",
              pointValue: 16
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Respuestas básicas",
              pointValue: 12
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Dificultad para responder preguntas",
              pointValue: 4
            }
          ]
        },
        {
          id: crypto.randomUUID(),
          name: "Material Visual",
          description: "Las diapositivas y material visual apoyan efectivamente la presentación",
          maxPoints: 10,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Material visual muy efectivo y profesional",
              pointValue: 10
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Material visual claro y útil",
              pointValue: 8
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Material visual básico",
              pointValue: 6
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Material visual confuso o inadecuado",
              pointValue: 2
            }
          ]
        }
      ]
    });

    console.log("✅ Rúbrica de presentación creada");

    console.log("\n🎉 ¡Rúbricas de ejemplo creadas exitosamente!");
    console.log("📋 Rúbricas disponibles:");
    console.log("- Rúbrica General de Desarrollo de Software (100 puntos)");
    console.log("- Rúbrica de Presentación de Proyecto (100 puntos)");

  } catch (error) {
    console.error("❌ Error creando rúbricas:", error);
  }
}

if (import.meta.main) {
  await createSampleRubrics();
}
