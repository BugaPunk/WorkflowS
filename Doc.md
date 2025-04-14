UNIVERSIDAD LA SALLE
CARRERA DE INGENIERÍA DE SISTEMAS
PROYECTO DE GRADO
 
PLATAFORMA BASADA EN WORKFLOW PARA LA GESTIÓN DE PROYECTOS ACADÉMICOS EN LA UNIVERSIDAD LA SALLE

CASO: UNIVERSIDAD LA SALLE
Por: Ronald Choque Sillo
Tutor: Ing. Osamu Yokosaki Peñaranda

Proyecto de Grado presentado para la obtención
de Licenciatura en Ingeniería de Sistemas

La Paz Bolivia
2025 
 
 








ÍNDICE
 
ÍNDICE DE CONTENIDO
CAPÍTULO 1. 	 GENERALIDADES	1
1.1.	INTRODUCCIÓN	1
1.2.	ANTECEDENTES 	1
1.2.1.	Antecedentes Académicos	1
1.3.	PLANTEAMIENTO DEL PROBLEMA	2
1.3.1.	Identificación del problema	3
1.3.2.	Formulación de Problema	4
1.4.	OBJETIVOS 	4
1.4.1.	Objetivo General	4
1.4.2.	Objetivos Específicos	4
1.5.	JUSTIFICACIONES 	5
1.5.1.	Justificación Técnica	5
1.5.2.	Justificación Económica	5
1.5.3.	Justificación Social	5
1.6.	ALCANCES Y LIMITES 	6
1.6.1.	Alcances 	6
1.6.2.	Limites	6
CAPÍTULO 2. 	 MARCO TEORICO	7
2.1.	INGENIERIA DE SISTEMAS	8
2.2.	Características de la Ingeniería de Sistemas 	11
2.2.1.	Metodología	12
2.3.	INGENIERIA DE SOFTWARE	13
2.3.1.	Problemas y Soluciones	14
2.3.2.	Herramientas de Desarrollo	15
2.3.3.	METODOLOGÍA SCRUM	16
2.4.	APLICACION WEB	21
2.4.1.	Ventajas	22
2.4.2.	Funcionamiento	23
2.5.	BASE DE DATOS	27
2.5.1.	Sistema de gestion de base de datos	28
2.6.	DENO	31
2.7.	FRESH	32
CAPÍTULO 3. 	 MARCO APLICATIVO 	33
3.1.	PLANIFICACION METODOLÓGICA 	34



 
 
 








CAPÍTULO 1. 	 GENERALIDADES

 
 
1.1.	INTRODUCCIÓN
En el ámbito educativo actual, la gestión de proyectos en equipo es fundamental para el desarrollo de habilidades prácticas y colaborativas en los estudiantes. Sin embargo, la falta de herramientas especializadas para el seguimiento y evaluación de estos proyectos dificulta tanto la labor docente como el aprendizaje de los estudiantes. Los docentes enfrentan desafíos significativos al intentar gestionar múltiples equipos de estudiantes, cada uno con sus propias dinámicas y necesidades. 
La ausencia de una plataforma integral que permita aplicar la metodología Scrum en el entorno académico de manera efectiva limita la capacidad de los docentes para monitorear el progreso de los proyectos y proporcionar retroalimentación oportuna. La metodología Scrum, reconocida por su eficacia en la gestión de proyectos, no se está explotando al máximo en el entorno educativo debido a la falta de herramientas adecuadas. Los docentes necesitan una solución que les permita no solo asignar roles y seguir el progreso de los proyectos, sino también evaluar los entregables de manera eficiente. Además, los estudiantes requieren un entorno donde puedan colaborar de manera efectiva, aprender de sus experiencias y recibir retroalimentación constructiva.
1.2.	ANTECEDENTES 
1.2.1.	Antecedentes Académicos
"Diseño de una Propuesta de Aplicación de Scrum en la Ejecución de Proyectos de Infraestructura y Dotación de Espacios Lúdicos en el Municipio de Vista Hermosa – Departamento del Meta”, realizado por Julieth Natalia García Solano en la Universidad Santo Tomás (2021). Este proyecto propone la aplicación de Scrum en proyectos de infraestructura y dotación de espacios lúdicos en un contexto municipal, con el objetivo de mejorar la gestión de recursos y tiempos. A diferencia del enfoque en una plataforma digital, este trabajo se centra en proyectos de infraestructura física y no incluye el desarrollo de una herramienta tecnológica, limitándose a una propuesta metodológica para la gestión de proyectos en el sector público. 
"Utilización de la Metodología Scrum para el Desarrollo de un Sistema Utilizando Tecnologías Web”, realizado por Sergio García Gutiérrez en la Universidad Autónoma de Baja California Sur (2012). Este trabajo desarrolla un sistema web utilizando Scrum para gestionar proyectos en el área de innovación de una empresa de telecomunicaciones. Aunque comparte el uso de Scrum y tecnologías web, este proyecto se enfoca en un entorno empresarial y no incluye funcionalidades específicas para la evaluación de entregables o la asignación de roles en un contexto educativo. 
"Elaboración de una Guía Metodológica para la Gestión de Proyectos de Software Utilizando la Herramienta Gila y la Metodología Scrum”, realizado por Erick Alexander Vásquez Endara en la Universidad Técnica del Norte (2022). Este proyecto crea una guía metodológica para la gestión de proyectos de software utilizando Scrum y Gila, con el objetivo de mejorar las prácticas de desarrollo en estudiantes de ingeniería de software. A diferencia de otros enfoques, este trabajo se centra en la creación de una guía y utiliza Gila como herramienta principal, en lugar de desarrollar una plataforma web independiente basada en Laravel.
1.3.	PLANTEAMIENTO DEL PROBLEMA
En el ámbito educativo actual, la gestión de proyectos en equipo es esencial para el desarrollo de habilidades prácticas y colaborativas en los estudiantes. Sin embargo, la falta de herramientas especializadas para el seguimiento y evaluación de estos proyectos dificulta tanto la labor docente como el aprendizaje de los estudiantes. Actualmente, los docentes enfrentan desafíos significativos al intentar gestionar múltiples equipos de estudiantes, cada uno con sus propias dinámicas y necesidades. La ausencia de una plataforma integral que permita aplicar la metodología Scrum en el entorno académico de manera efectiva limita la capacidad de los docentes para monitorear el progreso de los proyectos y proporcionar retroalimentación oportuna. 
La metodología Scrum, ampliamente reconocida por su eficacia en la gestión de proyectos, no se está explotando al máximo en el entorno educativo debido a la falta de herramientas adecuadas. Los docentes necesitan una solución que les permita no solo asignar roles y seguir el progreso de los proyectos, sino también evaluar los entregables de manera eficiente. Además, los estudiantes requieren un entorno donde puedan colaborar de manera efectiva, aprender de sus experiencias y recibir retroalimentación constructiva. 
La falta de una plataforma adecuada resulta en una gestión ineficiente de los proyectos, lo que puede llevar a retrasos, malentendidos y una menor calidad en los resultados finales. Esto no solo afecta el rendimiento académico de los estudiantes, sino también la capacidad de los docentes para guiar y evaluar el trabajo de sus estudiantes de manera efectiva.
1.3.1.	Identificación del problema
En la Universidad La Salle, los proyectos académicos en equipo representan una parte fundamental del proceso de aprendizaje, ya que permiten a los estudiantes desarrollar habilidades prácticas y colaborativas. Sin embargo, la gestión de estos proyectos enfrenta desafíos significativos debido a la falta de herramientas especializadas que faciliten su organización y seguimiento. Actualmente, los docentes utilizan métodos manuales o plataformas genéricas, como hojas de cálculo o sistemas de comunicación no integrados, lo que dificulta la aplicación efectiva de metodologías ágiles como Scrum. Esta situación genera una serie de problemas que afectan tanto a los docentes como a los estudiantes. Por un lado, los docentes enfrentan al monitorear el progreso de los sprints (iteraciones) de manera eficiente. 
La falta de una plataforma centralizada obliga a los profesores a dedicar tiempo excesivo a tareas administrativas, como recopilar avances de manera manual o coordinar reuniones de seguimiento sin un registro claro de las tareas completadas. Además, la evaluación de los entregables se realiza de manera subjetiva y desestructurada, lo que dificulta la retroalimentación oportuna y constructiva para los estudiantes. Por otro lado, los estudiantes experimentan desafíos al trabajar en equipo sin una guía clara sobre cómo aplicar Scrum en sus proyectos. La falta de una herramienta que les permita visualizar el backlog de tareas, gestionar sprints y recibir retroalimentación estructurada genera desorganización y, en algunos casos, conflictos internos. 
Esto se traduce en proyectos entregados fuera de plazo, una distribución desigual del trabajo y una percepción de inequidad en las calificaciones. La ausencia de una plataforma adaptada al contexto académico que permita gestionar proyectos bajo la metodología Scrum limita la capacidad de los docentes para guiar y evaluar el trabajo de los estudiantes, mientras que los estudiantes pierden la oportunidad de aprender y aplicar metodologías ágiles de manera efectiva. Este problema no solo afecta la calidad de los proyectos académicos, sino también la experiencia de aprendizaje de los estudiantes y la eficiencia del proceso de enseñanza.
1.3.2.	Formulación de Problema
La falta de una plataforma especializada para gestionar proyectos académicos bajo la metodología Scrum en la Universidad La Salle genera ineficiencias en el seguimiento y evaluación de los trabajos en equipo.
1.4.	OBJETIVOS 
1.4.1.	Objetivo General
Desarrollar una plataforma web que permita la creación y gestión de equipos de estudiantes para llevar a cabo proyectos bajo la metodología Scrum, facilitando el seguimiento y evaluación de los progresos por parte de los docentes, para mejorar la eficiencia y colaboración en el entorno académico.
1.4.2.	Objetivos Específicos
- Analizar los requisitos funcionales y no funcionales de la plataforma, asegurando que se alineen con las necesidades de los docentes y estudiantes en el contexto de la metodología Scrum. 
- Diseñar un sistema de gestión de equipos y roles, permitiendo a los docentes crear y administrar equipos de estudiantes con roles específicos. 
- Desarrollar módulos para el seguimiento de iteraciones y tareas, proporcionando herramientas para la planificación y monitoreo del progreso de los proyectos. 
- Implementar funcionalidades para la evaluación y calificación de los entregables, permitiendo a los docentes proporcionar retroalimentación detallada y realizar un seguimiento del desempeño de los equipos.
1.5.	JUSTIFICACIONES 
1.5.1.	Justificación Técnica
La implementación de una plataforma basada en Laravel permitirá aprovechar las ventajas de un framework robusto y escalable, facilitando el desarrollo y mantenimiento del sistema. Además, la metodología Scrum es ampliamente reconocida por su eficacia en la gestión de proyectos, lo que asegura una base sólida para el desarrollo de la plataforma.
1.5.2.	Justificación Económica
La plataforma optimizará el tiempo y los recursos dedicados a la gestión de proyectos en el entorno académico, reduciendo la carga administrativa de los docentes y mejorando la eficiencia en la evaluación de los trabajos de los estudiantes. Esto puede traducirse en una mejora en la calidad educativa y en la satisfacción de los usuarios.
1.5.3.	Justificación Social
La implementación de esta plataforma contribuirá al desarrollo de habilidades colaborativas y de gestión de proyectos en los estudiantes, preparándolos mejor para el entorno laboral. Además, facilitará la interacción y comunicación entre docentes y estudiantes, fomentando un ambiente de aprendizaje más dinámico y participativo. 
1.6.	ALCANCES Y LIMITES 
1.6.1.	Alcances 
1.6.1.1.	Alcance Temático
El proyecto se centra en la gestión de proyectos basados en la metodología Scrum en el ámbito educativo. 
1.6.1.2.	Alcance Geográfico
La plataforma estará disponible para su uso en la Universidad La Salle. 
1.6.1.3.	Alcance Temporal
El desarrollo de la plataforma se llevará a cabo durante el período académico establecido para la realización del proyecto de grado.
1.6.2.	Limites
La plataforma no incluirá funcionalidades avanzadas de inteligencia artificial o análisis predictivo. El alcance del proyecto se limita a la implementación y prueba de la plataforma en el entorno académico de la Universidad La Salle. La plataforma no contempla la integración con sistemas externos de gestión educativa. 
