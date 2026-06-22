import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "[ErrorBoundary] Error no controlado:",
      error,
      info.componentStack,
    );
  }

  override render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            color: "var(--color-text)",
            background: "var(--color-bg)",
          }}
        >
          <h1 style={{ color: "var(--color-gold)", fontSize: "2rem" }}>
            Algo salió mal
          </h1>
          <p style={{ maxWidth: "480px", opacity: 0.8 }}>
            Se produjo un error inesperado. Puedes intentar recargar la página;
            tu partida guardada no se ve afectada.
          </p>
          <pre
            style={{
              fontSize: "0.75rem",
              opacity: 0.5,
              maxWidth: "600px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1rem",
              padding: "0.6rem 1.4rem",
              background: "var(--color-gold)",
              color: "#1e1b2e",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
