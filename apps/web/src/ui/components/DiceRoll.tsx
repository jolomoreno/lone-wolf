import { forwardRef, useImperativeHandle, useRef } from "react";

export interface DiceRollHandle {
  roll(value: number, onDone: () => void): void;
  reset(): void;
}

interface Props {
  size?: "sm" | "lg";
}

const SIDE_INIT = [3, 7, 1, 5, 9];

export const DiceRoll = forwardRef<DiceRollHandle, Props>(
  function DiceRoll({ size = "sm" }, ref) {
    const boxRef = useRef<HTMLDivElement>(null);
    const frontRef = useRef<HTMLDivElement>(null);
    const rxRef = useRef(0);
    const ryRef = useRef(0);
    const rollingRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const intRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    useImperativeHandle(
      ref,
      () => ({
        roll(value, onDone) {
          const box = boxRef.current;
          const front = frontRef.current;
          if (!box || !front || rollingRef.current) return;
          rollingRef.current = true;

          // Populate side faces with values other than the result
          const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            .filter((n) => n !== value)
            .sort(() => Math.random() - 0.5);
          box
            .querySelectorAll<HTMLElement>(".die-face-side")
            .forEach((f, i) => {
              f.textContent = String(pool[i]);
            });
          front.textContent = String(Math.floor(Math.random() * 10));

          // Phase 1: linear roll (950 ms)
          const rollRx = rxRef.current + 540 + Math.random() * 100;
          const rollRy = ryRef.current + 500 + Math.random() * 100;
          // Settle at next 720° multiple + small tilt so no face is exactly at 90°
          const settRx = Math.round((rxRef.current + 720) / 720) * 720 + 3;
          const settRy = Math.round((ryRef.current + 720) / 720) * 720 + 5;

          intRef.current = setInterval(() => {
            if (front) front.textContent = String(Math.floor(Math.random() * 10));
          }, 72);

          box.style.transition = "transform 950ms linear";
          box.style.transform = `rotateX(${rollRx}deg) rotateY(${rollRy}deg)`;

          timerRef.current = setTimeout(() => {
            clearInterval(intRef.current);
            front.textContent = String(value);

            // Phase 2: spring settle (500 ms)
            box.style.transition =
              "transform 500ms cubic-bezier(.34,1.42,.64,1)";
            box.style.transform = `rotateX(${settRx}deg) rotateY(${settRy}deg)`;

            // Flash border gold on land
            const faces = box.querySelectorAll<HTMLElement>(".die-face");
            faces.forEach((f) => {
              f.style.borderColor = "#ffe0a0";
              f.style.borderWidth = "3.5px";
            });

            timerRef.current = setTimeout(() => {
              rxRef.current = settRx;
              ryRef.current = settRy;
              faces.forEach((f) => {
                f.style.borderColor = "";
                f.style.borderWidth = "";
              });
              box.style.transition = "";
              rollingRef.current = false;
              onDone();
            }, 540);
          }, 950);
        },

        reset() {
          clearTimeout(timerRef.current);
          clearInterval(intRef.current);
          const box = boxRef.current;
          const front = frontRef.current;
          if (!box || !front) return;
          rollingRef.current = false;
          rxRef.current = 0;
          ryRef.current = 0;
          box.style.transition = "none";
          box.style.transform = "rotateX(0deg) rotateY(0deg)";
          front.textContent = "?";
          box.querySelectorAll<HTMLElement>(".die-face").forEach((f) => {
            f.style.borderColor = "";
            f.style.borderWidth = "";
          });
        },
      }),
      [],
    );

    const half = size === "sm" ? 31 : 45;
    const dim = size === "sm" ? 62 : 90;
    const persp = size === "sm" ? 200 : 300;

    const sideTransforms = [
      `rotateY(180deg) translateZ(${half}px)`,
      `rotateY(90deg) translateZ(${half}px)`,
      `rotateY(-90deg) translateZ(${half}px)`,
      `rotateX(90deg) translateZ(${half}px)`,
      `rotateX(-90deg) translateZ(${half}px)`,
    ];

    return (
      <div className={`die-wrap die-wrap-${size}`}>
        <div
          style={{
            perspective: `${persp}px`,
            perspectiveOrigin: "50% 40%",
            width: dim,
            height: dim,
          }}
        >
          <div
            ref={boxRef}
            style={{
              width: dim,
              height: dim,
              position: "relative",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              ref={frontRef}
              className={`die-face die-face-${size} die-face-front`}
              style={{ transform: `translateZ(${half}px)` }}
            >
              ?
            </div>
            {sideTransforms.map((t, i) => (
              <div
                key={i}
                className={`die-face die-face-${size} die-face-side`}
                style={{ transform: t }}
              >
                {SIDE_INIT[i]}
              </div>
            ))}
          </div>
        </div>
        {/* 2px border matching card bg masks CSS 3D edge artifacts */}
        <div className="die-visor" />
      </div>
    );
  },
);
