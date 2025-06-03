import { Handlers } from "$fresh/server.ts";
import { getSprintById } from "@/models/sprint.ts";
import { getUserStoriesBySprintId } from "@/models/userStory.ts";
import { getUserStoryTasks } from "@/models/task.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      const sprintId = ctx.params.id;
      
      if (!sprintId) {
        return new Response(
          JSON.stringify({ error: "Sprint ID es requerido" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Obtener datos del sprint
      const sprint = await getSprintById(sprintId);
      if (!sprint) {
        return new Response(
          JSON.stringify({ error: "Sprint no encontrado" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Obtener historias de usuario del sprint
      const userStories = await getUserStoriesBySprintId(sprintId);
      
      // Obtener todas las tareas de las historias de usuario
      const allTasks = [];
      const tasksByStory = {};
      
      for (const story of userStories) {
        const tasks = await getUserStoryTasks(story.id);
        allTasks.push(...tasks);
        tasksByStory[story.id] = tasks;
      }

      // Calcular métricas básicas
      const totalStoryPoints = userStories.reduce((sum, story) => sum + (story.points || 0), 0);
      const completedStoryPoints = userStories
        .filter(story => story.status === "done")
        .reduce((sum, story) => sum + (story.points || 0), 0);
      
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.status === "done").length;
      const inProgressTasks = allTasks.filter(task => task.status === "in_progress").length;
      const todoTasks = allTasks.filter(task => task.status === "todo").length;

      // Información de fechas
      const now = new Date();
      const sprintStart = sprint.startDate ? new Date(sprint.startDate) : null;
      const sprintEnd = sprint.endDate ? new Date(sprint.endDate) : null;
      
      let sprintDuration = 0;
      let daysSinceStart = 0;
      
      if (sprintStart && sprintEnd) {
        sprintDuration = Math.ceil((sprintEnd.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24));
        daysSinceStart = Math.ceil((now.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Calcular burndown ideal
      const idealBurndownPerDay = sprintDuration > 0 ? totalStoryPoints / sprintDuration : 0;
      const idealRemainingToday = Math.max(0, totalStoryPoints - (daysSinceStart * idealBurndownPerDay));

      const debugInfo = {
        sprint: {
          id: sprint.id,
          name: sprint.name,
          status: sprint.status,
          startDate: sprintStart?.toISOString(),
          endDate: sprintEnd?.toISOString(),
          duration: sprintDuration,
          daysSinceStart: daysSinceStart
        },
        userStories: {
          total: userStories.length,
          totalPoints: totalStoryPoints,
          completedPoints: completedStoryPoints,
          remainingPoints: totalStoryPoints - completedStoryPoints,
          stories: userStories.map(story => ({
            id: story.id,
            title: story.title,
            status: story.status,
            points: story.points || 0,
            createdAt: new Date(story.createdAt).toISOString(),
            updatedAt: new Date(story.updatedAt).toISOString()
          }))
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          todo: todoTasks,
          byStory: Object.keys(tasksByStory).map(storyId => ({
            storyId,
            storyTitle: userStories.find(s => s.id === storyId)?.title,
            tasks: tasksByStory[storyId].map(task => ({
              id: task.id,
              title: task.title,
              status: task.status,
              createdAt: new Date(task.createdAt).toISOString(),
              updatedAt: new Date(task.updatedAt).toISOString()
            }))
          }))
        },
        burndownCalculation: {
          totalStoryPoints,
          idealBurndownPerDay,
          idealRemainingToday,
          actualRemainingPoints: totalStoryPoints - completedStoryPoints,
          progressPercentage: totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0
        },
        timestamps: {
          now: now.toISOString(),
          sprintStart: sprintStart?.toISOString(),
          sprintEnd: sprintEnd?.toISOString()
        }
      };

      return new Response(
        JSON.stringify(debugInfo, null, 2),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    } catch (error) {
      console.error("Error en burndown debug:", error);
      return new Response(
        JSON.stringify({ 
          error: "Error interno del servidor",
          details: error.message 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
