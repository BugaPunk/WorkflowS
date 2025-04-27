import type { Preview } from "@storybook/react";
import "../static/styles.css"; // Importa los estilos globales de tu aplicación

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
