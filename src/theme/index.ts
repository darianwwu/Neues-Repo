import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false
};

// Apple-esque: lots of whitespace, subtle borders/shadows, system font.
export const theme = extendTheme({
  config,
  fonts: {
    heading:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    body:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  styles: {
    global: {
      'html, body': {
        background: '#f5f5f7',
        color: '#111827'
      },
      '::selection': {
        background: '#dbeafe'
      }
    }
  },
  radii: {
    xl: '18px'
  },
  shadows: {
    outline: '0 0 0 3px rgba(59,130,246,0.35)'
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '14px',
        fontWeight: 600
      }
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: '14px'
        }
      }
    },
    Textarea: {
      baseStyle: {
        borderRadius: '14px'
      }
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '18px'
        }
      }
    }
  }
});
