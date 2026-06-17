import { forwardRef, useImperativeHandle, useRef } from "react";

export interface DiceRollHandle {
  roll(value: number, onDone: () => void): void;
  reset(): void;
}

interface Props {
  size?: "sm" | "lg";
}

// Una sola vuelta de la animación dura 500 ms; ROLL_MS la encadena un nº
// entero de veces para que el bucle empalme sin saltos antes de aterrizar.
const ROLL_MS = 1000;
const FLICKER_MS = 70;
const LAND_MS = 450;

export const DiceRoll = forwardRef<DiceRollHandle, Props>(
  function DiceRoll({ size = "sm" }, ref) {
    const dieRef = useRef<HTMLDivElement>(null);
    const rollingRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const intRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    useImperativeHandle(
      ref,
      () => ({
        roll(value, onDone) {
          const die = dieRef.current;
          if (!die || rollingRef.current) return;
          rollingRef.current = true;

          die.classList.remove("die--land");
          die.classList.add("die--rolling");

          // Parpadeo de dígitos aleatorios mientras gira: es lo que vende la
          // sensación de "tirada" sin necesidad de caras 3D reales.
          intRef.current = setInterval(() => {
            die.textContent = String(Math.floor(Math.random() * 10));
          }, FLICKER_MS);

          timerRef.current = setTimeout(() => {
            clearInterval(intRef.current);
            die.textContent = String(value);
            die.classList.remove("die--rolling");
            // Forzar reflujo para reiniciar limpiamente la animación de aterrizaje.
            void die.offsetWidth;
            die.classList.add("die--land");

            timerRef.current = setTimeout(() => {
              rollingRef.current = false;
              onDone();
            }, LAND_MS);
          }, ROLL_MS);
        },

        reset() {
          clearTimeout(timerRef.current);
          clearInterval(intRef.current);
          rollingRef.current = false;
          const die = dieRef.current;
          if (!die) return;
          die.classList.remove("die--rolling", "die--land");
          die.textContent = "?";
        },
      }),
      [],
    );

    return (
      <div className={`die-wrap die-wrap-${size}`}>
        <div ref={dieRef} className={`die die-${size}`}>
          ?
        </div>
      </div>
    );
  },
);
